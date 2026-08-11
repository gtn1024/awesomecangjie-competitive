---
oj: dmy
pid: '384'
title: '[R61F] 图'
difficulty: 普及+/提高
tags:
  - 补图
  - 二分图
  - 分组背包
timeLimit: 1.5s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 3000$，$0 \le m \le n(n-1)/2$，$1 \le w_i \le 10^9$。

## 思路

合法划分要求 $S_1$、$S_2$ 在原图中都是团。转到**补图**中看：原图的团恰好对应补图的独立集，因此划分合法当且仅当 $S_1$、$S_2$ 在补图中都是独立集，也就是说补图必须能被二分染色。若补图含奇环（不是二分图），则不存在任何合法划分，答案全为 $0$。

对补图进行二分图染色。每个连通分量恰好有两种染色方式（两种颜色可整体互换），记录每个分量中两种颜色各自的点数 $siz_0, siz_1$ 与点权和 $sum_0, sum_1$。一个合法划分就是在每个连通分量中二选一：选中颜色的点并入 $S_1$，另一种颜色的点自动归入 $S_2$。

于是问题转化为**分组背包**：每组二选一，问选出的点数恰好为 $j$ 时，所有方案的总价值之和。设 $dp[j]$ 为已处理的分量中选出 $j$ 个点的总价值和，$cnt[j]$ 为对应的方案数，初始 $dp[0] = 0$，$cnt[0] = 1$。每加入一个分量时：

$$
\begin{aligned}
dp'[j + siz_0] &\mathrel{+}= dp[j] + cnt[j] \times sum_0 \\
cnt'[j + siz_0] &\mathrel{+}= cnt[j]
\end{aligned}
$$

对 $siz_1, sum_1$ 做同样的转移。方案数乘上所选部分的点权和，是因为这部分的价值会随前置的每种方案重复出现；转移中所有量对 $10^9 + 7$ 取模。

最终 $dp[k]$ 就是 $|S_1| = k$ 的所有合法划分的价值总和。

## 复杂度

时间 $O(n^2)$（补图染色 $O(n^2)$，背包 $O(n^2)$），空间 $O(n^2)$（邻接矩阵）。

## 仓颉实现

要点：

- 输入最多约 450 万行边，逐行 `readln` 解析会超时，因此用 `getStdIn()` 分块读入全部字节，再手写整数解析。
- 只存原图邻接矩阵，补图边即「原图无边」。
- 染色用 BFS（数组模拟队列）；背包数组滚动更新。

```cangjie
import std.env.*

const MOD: Int64 = 1000000007

var data: Array<UInt8> = Array<UInt8>(0, { _ => 0 })
var dataLen: Int64 = 0
var pos: Int64 = 0

// 分块读入 stdin 全部字节，再手写整数解析（大输入下比逐行 split 快）
func readAll(reader: ConsoleReader): Unit {
    let cap: Int64 = 70000000
    data = Array<UInt8>(cap, { _ => 0 })
    var total: Int64 = 0
    let chunk = Array<UInt8>(1 << 20, { _ => 0 })
    while (true) {
        let got = reader.read(chunk)
        if (got <= 0) {
            break
        }
        chunk.copyTo(data, 0, total, got)
        total += got
        if (total >= cap) {
            break
        }
    }
    dataLen = total
}

func nextInt(): Int64 {
    var x: Int64 = 0
    while (pos < dataLen && Int64(data[pos]) <= 32) {
        pos += 1
    }
    while (pos < dataLen && Int64(data[pos]) > 32) {
        x = x * 10 + (Int64(data[pos]) - 48)
        pos += 1
    }
    return x
}

main(): Int64 {
    readAll(getStdIn())

    let n = nextInt()
    let m = nextInt()
    let nn = n
    let w = Array<Int64>(nn, { _ => 0 })
    var i = 0
    while (i < nn) {
        w[i] = nextInt()
        i += 1
    }

    // 原图邻接矩阵；补图有边当且仅当原图无边
    let g = Array<Array<Bool>>(nn, { _ => Array<Bool>(nn, { _ => false }) })
    var e = 0
    while (e < m) {
        let u = nextInt() - 1
        let v = nextInt() - 1
        g[u][v] = true
        g[v][u] = true
        e += 1
    }

    // 对补图二分染色，统计每个连通分量两种颜色的点数与点权和
    let color = Array<Int64>(nn, { _ => -1 })
    let queue = Array<Int64>(nn, { _ => 0 })
    let cs0 = Array<Int64>(nn, { _ => 0 })
    let cs1 = Array<Int64>(nn, { _ => 0 })
    let csu0 = Array<Int64>(nn, { _ => 0 })
    let csu1 = Array<Int64>(nn, { _ => 0 })
    var comp = 0
    var bad = false
    i = 0
    while (i < nn && !bad) {
        if (color[i] == -1) {
            color[i] = 0
            var head = 0
            var tail = 0
            queue[tail] = i
            tail += 1
            var s0 = 1
            var s1 = 0
            var su0 = w[i] % MOD
            var su1 = 0
            while (head < tail && !bad) {
                let x = queue[head]
                head += 1
                var v = 0
                while (v < nn && !bad) {
                    if (v != x && !g[x][v]) {
                        if (color[v] == -1) {
                            color[v] = 1 - color[x]
                            queue[tail] = v
                            tail += 1
                            if (color[v] == 0) {
                                s0 += 1
                                su0 = (su0 + w[v]) % MOD
                            } else {
                                s1 += 1
                                su1 = (su1 + w[v]) % MOD
                            }
                        } else if (color[v] == color[x]) {
                            bad = true
                        }
                    }
                    v += 1
                }
            }
            if (!bad) {
                cs0[comp] = s0
                cs1[comp] = s1
                csu0[comp] = su0
                csu1[comp] = su1
                comp += 1
            }
        }
        i += 1
    }

    // 补图不是二分图：不存在合法划分
    if (bad) {
        let sb0 = StringBuilder()
        var k0 = 0
        while (k0 < nn) {
            if (k0 > 0) {
                sb0.append(" ")
            }
            sb0.append(0)
            k0 += 1
        }
        println(sb0.toString())
        return 0
    }

    // 分组背包：每个连通分量二选一，dp[j] 为选出 j 个点时的总价值和
    var cnt = Array<Int64>(nn + 1, { _ => 0 })
    var dp = Array<Int64>(nn + 1, { _ => 0 })
    cnt[0] = 1
    var curSize = 0
    var c = 0
    while (c < comp) {
        let s0 = cs0[c]
        let s1 = cs1[c]
        let su0 = csu0[c]
        let su1 = csu1[c]
        let newCnt = Array<Int64>(nn + 1, { _ => 0 })
        let newDp = Array<Int64>(nn + 1, { _ => 0 })
        var j = 0
        while (j <= curSize) {
            if (cnt[j] != 0) {
                var ns = j + s0
                newCnt[ns] = (newCnt[ns] + cnt[j]) % MOD
                newDp[ns] = (newDp[ns] + dp[j] + cnt[j] * su0 % MOD) % MOD
                ns = j + s1
                newCnt[ns] = (newCnt[ns] + cnt[j]) % MOD
                newDp[ns] = (newDp[ns] + dp[j] + cnt[j] * su1 % MOD) % MOD
            }
            j += 1
        }
        curSize += s0 + s1
        cnt = newCnt
        dp = newDp
        c += 1
    }

    let sb = StringBuilder()
    var k = 1
    while (k <= nn) {
        if (k > 1) {
            sb.append(" ")
        }
        sb.append(dp[k])
        k += 1
    }
    println(sb.toString())
    return 0
}
```
