---
oj: dmy
pid: '183'
title: '[R30D]路径第K小'
difficulty: 提高
tags:
  - 二分
  - 动态规划
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le N, M \le 1000$，$1 \le K \le N+M-1$，$1 \le A_{i,j} \le 10^9$。

## 思路

从 $(1,1)$ 到 $(N,M)$ 只能向右或向下走，路径恰好经过 $N+M-1$ 个格子，这些格子上的数构成一个多重集。要让这个多重集升序后第 $K$ 小的数尽量大。

直接枚举路径不可行，改用 **二分答案**：二分一个阈值 $X$，判断「是否存在一条路径，使路径上 $\geq X$ 的元素个数足够多」。

关键转化：路径长度为 $L = N+M-1$。若想让升序后第 $K$ 小的位置上的值 $\geq X$，等价于这条路径里至少要有 $L - K + 1$ 个元素 $\geq X$（这样第 $K$ 小及以后的元素都 $\geq X$）。

于是判定问题变为：**是否存在路径，使路径中 $\geq X$ 的元素个数 $\geq L - K + 1$**。这用 DP 解决：

$$f[i][j] = \max(f[i-1][j],\ f[i][j-1]) + [A_{i,j} \geq X]$$

$f[i][j]$ 表示从 $(1,1)$ 到 $(i,j)$ 的所有路径中，$\geq X$ 的元素个数的最大值。最后看 $f[N][M] \geq L - K + 1$ 是否成立。

二分时直接对值域 $[1, 10^9]$ 二分即可，二分轮数约 $30$。DP 用一维滚动数组（`prev`、`cur` 两行）省内存，转移时注意第 $(1,1)$ 格的起点是 $0$，其余格子若既无法从上方也无法从左方到达（实际不会发生在合法网格里），用极小值 $-\infty$ 标记不可达。

## 复杂度

时间 $O(NM \log V)$，其中 $V = 10^9$，约 $30$ 轮二分，$N,M \le 1000$，总运算量约 $3 \times 10^7$，1s 内可过。空间 $O(M)$（滚动数组）。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
// [R30D]路径第K小
// 二分答案 X, 判定是否存在路径使 >=X 的元素个数 >= (N+M-1)-K+1.
// DP: f[i][j] = max(f[i-1][j], f[i][j-1]) + (A[i][j]>=X ? 1 : 0), 一维滚动.

import std.console.*
import std.convert.*

main() {
    let reader = Console.stdIn
    let header = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(header[0])
    let m = Int64.parse(header[1])
    let k = Int64.parse(header[2])

    let a = Array<Array<Int64>>(n, { _ =>
        reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    })

    var lo = Int64(1)
    var hi = Int64(1000000000)
    var ans = Int64(1)
    while (lo <= hi) {
        let mid = (lo + hi) / 2
        if (check(a, n, m, k, mid)) {
            ans = mid
            lo = mid + 1
        } else {
            hi = mid - 1
        }
    }
    println(ans)
}

func check(a: Array<Array<Int64>>, n: Int64, m: Int64, k: Int64, x: Int64): Bool {
    let need = n + m - 1 - k + 1
    let NINF = Int64(-1000000000)
    var prev = Array<Int64>(m, { _ => NINF })
    for (i in 0..n) {
        var cur = Array<Int64>(m, { _ => NINF })
        for (j in 0..m) {
            var best = NINF
            if (i == 0 && j == 0) {
                best = 0
            } else {
                if (i > 0 && prev[j] > best) {
                    best = prev[j]
                }
                if (j > 0 && cur[j - 1] > best) {
                    best = cur[j - 1]
                }
            }
            if (a[i][j] >= x) {
                cur[j] = best + 1
            } else {
                cur[j] = best
            }
        }
        prev = cur
    }
    return prev[m - 1] >= need
}
```

</details>
