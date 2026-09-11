---
oj: dmy
pid: '65'
title: '[R11E] 波浪数'
difficulty: 提高
tags:
  - 数位DP
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le q \le 10$，$1 \le L_i \le R_i \le 10^{100000}$。

## 思路

数位按低位到高位编号为 $X_1, X_2, \dots, X_{len}$。波浪数有两种形态：

- 第一类：$X_1 > X_2 < X_3 > X_4 < \cdots$（相邻数位交替「降、升、降、升」），即奇数位是峰、偶数位是谷；
- 第二类：$X_1 < X_2 > X_3 < X_4 > \cdots$（相邻数位交替「升、降、升、降」），即奇数位是谷、偶数位是峰。

等价地，把每对相邻数位 $(i, i+1)$ 看作一个关系：第一类要求偶数 $i$ 处 $X_{i+1} > X_i$、奇数 $i$ 处 $X_{i+1} < X_i$；第二类相反。单一位数两种形态都平凡成立，故 $1 \sim 9$ 都是波浪数。

由于 $R_i$ 高达 $10^{100000}$，必须把数当字符串做数位 DP。设 $\text{ask}(X)$ 表示 $[1, X]$ 中波浪数的个数，则答案为 $\text{ask}(R) - \text{ask}(L-1)$，其中 $L-1$ 是大数减一（字符串借位实现）。

**预处理。** 定义 $f[i][j][k]$ 为「长度恰为 $i$、最高位 $X_i = j$、且整个序列属于第 $k$ 类」的序列数（低位 $X_1 \dots X_{i-1}$ 任意）。转移时枚举新最高位 $X_i = Y$ 与原最高位 $X_{i-1} = Z$，若数对 $(i-1, i)$ 满足第 $k$ 类的关系就把 $f[i-1][Z][k]$ 累加进 $f[i][Y][k]$。边界 $f[1][j][k] = 1$。再预处理前缀和 $\text{preG}[m] = G_1 + \dots + G_m$，其中 $G_m$ 为位数恰为 $m$ 的波浪数个数（$G_1 = 9$；$m \ge 2$ 时两类互斥，$G_m = \sum_{j=1}^{9}(f[m][j][1] + f[m][j][2])$）。

**数位计数 $\text{ask}(X)$。** 设 $n = \text{len}(X)$：

1. 位数 $< n$ 的波浪数共 $\text{preG}[n-1]$ 个；
2. 若 $X$ 本身是波浪数，答案加 $1$；
3. 枚举最高位起第一个「变小」的位置 $L$（从低到高的第 $L$ 位）：比 $L$ 更高的位与 $X$ 完全相同，$X_L$ 取一个小于 $X$ 第 $L$ 位的值 $Y$，$X_L$ 以下的位任意。此时 $X_{L+1} \dots X_n$ 是 $X$ 的真实数位，必须自身满足第 $k$ 类关系；用一个滚动布尔量 $\text{fixedOk}_k$ 维护「已固定的更高位是否仍符合第 $k$ 类」，再单独判断跨越 $L, L+1$ 的数对。若整段一致，就把 $f[L][Y][k]$ 累加进答案。$f[L][Y][k]$ 内部已保证 $X_1 \dots X_{L-1}$ 与 $X_L = Y$ 构成第 $k$ 类，因此只需保证边界。

遍历 $L$ 从 $n$ 到 $1$，每次 $Y$ 至多 $10$ 种取值，单次询问 $O(10n)$。全程对 $998244353$ 取模。复杂度 $O(100n + 10qn)$，其中 $n$ 为最大位数。

注意两点细节：位数恰为 $n$ 时最高位 $X_n$ 不能为 $0$，故 $L = n$ 且 $Y = 0$ 的分支要跳过（否则会与更短位数重复计数）；$n = 1$ 时每一位数同时满足两类、会出现重复计数，直接返回该数值即可（$[1, X]$ 中一位波浪数恰有 $X$ 个）。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.collection.*

let MOD: Int64 = 998244353

main(): Int64 {
    let reader = getStdIn()
    let q = Int64.parse(reader.readln().getOrThrow())
    // 读入所有询问
    let lines = ArrayList<Array<String>>()
    var maxn = 0
    for (_ in 0..q) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        lines.add(parts)
        let rl = parts[1].size
        if (rl > maxn) {
            maxn = rl
        }
        let ll = parts[0].size
        if (ll > maxn) {
            maxn = ll
        }
    }
    // 预处理 f[i][j][k]: 长度 i、最高位(从低到高第 i 位)为 j 的第 k 类波浪序列数
    // k=0 -> pattern1 (X_1 > X_2 < X_3 > ...), k=1 -> pattern2
    // 扁平数组: idx = i*20 + j*2 + k, i 范围 0..maxn
    let N = maxn
    let fsize = (N + 1) * 20
    let f = Array<Int64>(fsize, { _ => 0 })
    var j = 0
    while (j <= 9) {
        f[1 * 20 + j * 2 + 0] = 1
        f[1 * 20 + j * 2 + 1] = 1
        j += 1
    }
    var i = 2
    while (i <= N) {
        var Y = 0
        while (Y <= 9) {
            var Z = 0
            while (Z <= 9) {
                // pair (i-1, i)
                // pattern1: (i-1) even -> Y>Z ; (i-1) odd -> Y<Z
                // pattern2: reverse
                if (((i - 1) % 2) == 0) {
                    if (Y > Z) {
                        f[i * 20 + Y * 2 + 0] = (f[i * 20 + Y * 2 + 0] + f[(i - 1) * 20 + Z * 2 + 0]) % MOD
                    }
                    if (Y < Z) {
                        f[i * 20 + Y * 2 + 1] = (f[i * 20 + Y * 2 + 1] + f[(i - 1) * 20 + Z * 2 + 1]) % MOD
                    }
                } else {
                    if (Y < Z) {
                        f[i * 20 + Y * 2 + 0] = (f[i * 20 + Y * 2 + 0] + f[(i - 1) * 20 + Z * 2 + 0]) % MOD
                    }
                    if (Y > Z) {
                        f[i * 20 + Y * 2 + 1] = (f[i * 20 + Y * 2 + 1] + f[(i - 1) * 20 + Z * 2 + 1]) % MOD
                    }
                }
                Z += 1
            }
            Y += 1
        }
        i += 1
    }
    // preG[m] = 长度恰为 m 的波浪数个数的前缀和 (G1[1]=9 即 1..9)
    let preG = Array<Int64>(N + 1, { _ => 0 })
    preG[1] = 9
    i = 2
    while (i <= N) {
        var sgm: Int64 = 0
        j = 1
        while (j <= 9) {
            sgm = (sgm + f[i * 20 + j * 2 + 0] + f[i * 20 + j * 2 + 1]) % MOD
            j += 1
        }
        preG[i] = (preG[i - 1] + sgm) % MOD
        i += 1
    }
    // isWave(s): 判断数字字符串(字节数组, 高位在前)是否为波浪数
    let isWave = { s: Array<UInt8> =>
        let n = s.size
        // dv(p) = 从低到高第 p 位的数字值 = s[n-p] - '0'
        let dv = { p: Int64 => Int64(s[n - p]) - 48 }
        var t1 = true
        var t2 = true
        var ii = 2
        while (ii <= n) {
            if ((ii % 2) == 0) {
                let a = dv(ii - 1)
                let b = dv(ii)
                if (a <= b) {
                    t1 = false
                }
                if (a >= b) {
                    t2 = false
                }
                if (ii < n) {
                    let c = dv(ii + 1)
                    if (b >= c) {
                        t1 = false
                    }
                    if (b <= c) {
                        t2 = false
                    }
                }
            }
            ii += 1
        }
        t1 || t2
    }
    // countUpto(s): [1, X] 中波浪数个数, X = s (字节数组, 高位在前)
    let countUpto = { s: Array<UInt8> =>
        let n = s.size
        // 一位数: 1..X 全是波浪数, 直接返回数值 (X="0" 时返回 0)
        if (n == 1) {
            Int64(s[0]) - 48
        } else {
        var ans: Int64 = 0
        // 长度 < n 的波浪数
        if (n - 1 >= 0) {
            ans = preG[n - 1]
        }
        // X 本身
        if (isWave(s)) {
            ans = (ans + 1) % MOD
        }
        // 长度 == n 且 < X
        let dv = { p: Int64 => Int64(s[n - p]) - 48 }
        var fixedOk1 = true
        var fixedOk2 = true
        var L = n
        while (L >= 1) {
            let dL = dv(L)
            let hasPrev = L < n
            var prev: Int64 = 0
            if (hasPrev) {
                prev = dv(L + 1)
            }
            var Y = 0
            while (Y < dL) {
                if (L == n && Y == 0) {
                    Y += 1
                    continue
                }
                // pattern1
                var ok1 = fixedOk1
                if (hasPrev) {
                    if ((L % 2) == 0) {
                        if (prev <= Y) {
                            ok1 = false
                        }
                    } else {
                        if (prev >= Y) {
                            ok1 = false
                        }
                    }
                }
                if (ok1) {
                    ans = (ans + f[L * 20 + Y * 2 + 0]) % MOD
                }
                // pattern2
                var ok2 = fixedOk2
                if (hasPrev) {
                    if ((L % 2) == 0) {
                        if (prev >= Y) {
                            ok2 = false
                        }
                    } else {
                        if (prev <= Y) {
                            ok2 = false
                        }
                    }
                }
                if (ok2) {
                    ans = (ans + f[L * 20 + Y * 2 + 1]) % MOD
                }
                Y += 1
            }
            // 更新 fixedOk: 固定部分加入位置 L = dL
            if (hasPrev) {
                if ((L % 2) == 0) {
                    if (prev <= dL) {
                        fixedOk1 = false
                    }
                    if (prev >= dL) {
                        fixedOk2 = false
                    }
                } else {
                    if (prev >= dL) {
                        fixedOk1 = false
                    }
                    if (prev <= dL) {
                        fixedOk2 = false
                    }
                }
            }
            L -= 1
        }
        ans
        }
    }
    // decStr(s): 大数减 1, 返回新的字节数组
    let decStr = { s: Array<UInt8> =>
        let m = s.size
        let digs = Array<Int64>(m, { k => Int64(s[k]) - 48 })
        var idx = m - 1
        while (idx >= 0 && digs[idx] == 0) {
            digs[idx] = 9
            idx -= 1
        }
        digs[idx] = digs[idx] - 1
        var k = 0
        while (k < m - 1 && digs[k] == 0) {
            k += 1
        }
        let len = m - k
        let kk = k
        Array<UInt8>(len, { t => UInt8(digs[kk + t] + 48) })
    }
    // 处理每个询问
    for (parts in lines) {
        let Lstr = parts[0].toArray()
        let Rstr = parts[1].toArray()
        let cR = countUpto(Rstr)
        let Lm1 = decStr(Lstr)
        let cL = countUpto(Lm1)
        var ans = (cR - cL) % MOD
        if (ans < 0) {
            ans = ans + MOD
        }
        println(ans)
    }
    return 0
}
```

要点：

- $f$ 数组用扁平一维数组存储（`idx = i*20 + j*2 + k`），避免多维数组在 $n = 10^5$ 时的对象开销。
- 滚动布尔量 `fixedOk1` / `fixedOk2` 把「已固定的更高位是否符合第 $k$ 类」维护成 $O(1)$，每次 $L$ 递减时增量更新，使整个数位计数为线性。
- 字符串以字节数组（`String.toArray()` 得到 `Array<UInt8>`）处理，按 $s[n-p]$ 取从低到高第 $p$ 位的数值。
