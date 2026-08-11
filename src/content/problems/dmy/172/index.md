---
oj: dmy
pid: '172'
title: '[R28E]最多好串'
difficulty: 提高
tags:
  - 字符串
  - 枚举
  - 差分
timeLimit: 1s
memoryLimit: 512m
---

> $1 \le n \le 1000$，字符串仅含小写字母。

## 思路

设修改后的字符串中「好」子串总数为 $G'$。位置 $i$ 上的字符改动只会影响**包含 $i$ 的子串**，不含 $i$ 的子串状态不变。因此

$$
f(i) = G - g_0(i) + \max_{c} g(i, c)
$$

其中 $G$ 为原串好子串总数，$g_0(i)$ 为原串中包含 $i$ 的好子串个数，$g(i, c)$ 为把 $S[i]$ 改成 $c$ 后包含 $i$ 的好子串个数。

注意把 $S[i]$ 改成它本身是允许的，此时 $g(i, S[i]) = g_0(i)$，故 $f(i) \ge G$ 恒成立。

### 如何刻画一个偶数子串

偶数长子串 $S[l..r]$（长度 $2k$）被中间缝 $g = l + k - 1$ 分为左半 $[l, g]$ 与右半 $[g+1, r]$。定义差分向量

$$
D[x] = \mathrm{cnt}_x(l, g) - \mathrm{cnt}_x(g+1, r)
$$

子串是好的当且仅当 $D = \mathbf{0}$。对每个缝 $g$，随 $k$ 增大（左端 $l = g-k$ 向左扩、右端 $r = g+k-1$ 向右扩），$D$ 可以增量维护：每次加入左边字符 $S[l]$ 使对应项 $+1$，加入右边字符 $S[r]$ 使对应项 $-1$，总复杂度 $O(n^2)$。

### 一次修改能救活哪些子串

若把左半某个字符 $x$ 改成 $y$，新的差分向量为 $D - e_x + e_y$，变为零当且仅当 $D = e_x - e_y$。因此**差为 $e_x - e_y$（恰好一项为 $+1$、一项为 $-1$）的子串，能被一次修改救活**：

- 左半中任意位置 $i$（$S[i] = x$）改成 $y$；
- 右半中任意位置 $i$（$S[i] = y$）改成 $x$。

对这样的子串，把它对左半所有 $x$ 位置（记到 $g(i, y)$）、右半所有 $y$ 位置（记到 $g(i, x)$）的贡献各加 $1$。总扫描量不超过所有偶数子串长度之和，$n = 1000$ 时约 $8 \times 10^7$ 次，足够快。

其余形态的 $D$（非零项超过两个，或差超过 $1$）不可能靠一次修改救活，直接忽略。

## 复杂度

时间 $O(n^2 \cdot 26 + n^3)$（枚举所有偶数子串 $O(n^2)$，每子串 $O(26)$ 判断形态；可修复子串的左右半扫描总量为 $O(n^3)$，常数极小，$n \le 1000$ 下远小于 $1$ 秒），空间 $O(26n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()

    // diffArr: 差分数组，统计每个位置被多少个「好」子串覆盖（得到 g0[i]）
    let diffArr = Array<Int64>(n + 1, { _ => 0 })
    // g1[i*26+c]：把 S[i] 改成字母 c 后，由「坏」变「好」且包含 i 的子串个数
    let g1 = Array<Int64>(n * 26, { _ => 0 })
    let diff = Array<Int64>(26, { _ => 0 })
    var goodTotal: Int64 = 0

    // 按中间缝 g 枚举所有偶数长子串：左半 [g-k, g-1]，右半 [g, g+k-1]
    var g: Int64 = 1
    while (g < n) {
        for (t in 0..26) {
            diff[t] = 0
        }
        var k: Int64 = 1
        while (g - k >= 0 && g + k - 1 < n) {
            let l = g - k
            let r = g + k - 1
            let ai = Int64(s[l]) - 97
            let bi = Int64(s[r]) - 97
            diff[ai] += 1
            diff[bi] -= 1

            var nz = 0
            var x: Int64 = -1
            var y: Int64 = -1
            for (t in 0..26) {
                if (diff[t] != 0) {
                    nz += 1
                    if (diff[t] == 1) {
                        x = t
                    } else if (diff[t] == -1) {
                        y = t
                    }
                }
            }
            if (nz == 0) {
                // 好子串：覆盖 [l, r]
                diffArr[l] += 1
                diffArr[r + 1] -= 1
                goodTotal += 1
            } else if (nz == 2 && x >= 0 && y >= 0) {
                // 差为 e_x - e_y：左半改 x->y，或右半改 y->x
                var i: Int64 = l
                while (i < g) {
                    if (Int64(s[i]) - 97 == x) {
                        g1[i * 26 + y] += 1
                    }
                    i += 1
                }
                i = g
                while (i <= r) {
                    if (Int64(s[i]) - 97 == y) {
                        g1[i * 26 + x] += 1
                    }
                    i += 1
                }
            }
            k += 1
        }
        g += 1
    }

    // 前缀和得到 g0[i]
    let g0 = Array<Int64>(n, { _ => 0 })
    var acc: Int64 = 0
    for (i in 0..n) {
        acc += diffArr[i]
        if (i < n) {
            g0[i] = acc
        }
    }

    // f(i) = G - g0[i] + max(g0[i], max_{c != S[i]} g1[i][c])
    let sb = StringBuilder()
    for (i in 0..n) {
        let si = Int64(s[i]) - 97
        var best = g0[i]
        for (c in 0..26) {
            if (c != si) {
                let v = g1[i * 26 + c]
                if (v > best) {
                    best = v
                }
            }
        }
        let ans = goodTotal - g0[i] + best
        if (i > 0) {
            sb.append(" ")
        }
        sb.append(ans)
    }
    println(sb.toString())
    return 0
}
```
