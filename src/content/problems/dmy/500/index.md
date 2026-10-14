---
oj: dmy
pid: '500'
title: 跳跃选择
difficulty: 普及−
tags:
  - 线性DP
  - 背包
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le N \le 100$，$1 \le X \le 10^4$，$1 \le A_i < B_i \le 100$。

## 思路

**状态定义。** 设 $f_i(s)$ 表示「恰好做完前 $i$ 次跳跃后，能否落在位置 $s$」。初始只有 $f_0(0)$ 为真，转移为

$$f_i(s) = f_{i-1}(s - A_i) \lor f_{i-1}(s - B_i).$$

答案即 $f_N(X)$，这就是一次 $0/1$ 背包式的线性 DP。

**必须按层转移。** 题意要求「恰好 $N$ 次」，所以第 $i$ 层只能保留恰好做完 $i$ 次跳跃得到的位置，每层都要新开一个数组（或使用上一层的副本）来累加。只用一个数组原地倒序更新是不行的：倒序虽然避免了同一次跳跃被重复选用，却把第 $i-1$ 层以前留下的状态一直带到第 $N$ 层，于是「用不足 $N$ 次跳跃凑出 $X$」会被误判为可达。

反例：$N = 19$、$X = 1$，其中某次跳跃可选 $1$ 或 $5$。$19$ 次跳跃每次至少前进 $1$ 格，总和不可能等于 $1$，答案应为 `No`；而原地保留旧状态的写法会输出 `Yes`。

**剪枝。** 跳跃距离都是正数，位置超过 $X$ 后不可能再回到 $X$，所以数组只需开到 $X$，每层也只扫描 $s \in [0, X]$。

顺带一提，题面样例 2 给的输出 `No` 与题意不符：两次跳跃分别取 $2$ 和 $3$ 恰好凑出 $5$，正确答案应为 `Yes`。

## 复杂度

时间 $O(NX)$，额外空间 $O(X)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let x = first[1]
    var dp = Array<Bool>(x + 1, { _ => false })
    dp[0] = true
    var i: Int64 = 0
    while (i < n) {
        let ab = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let a = ab[0]
        let b = ab[1]
        let ndp = Array<Bool>(x + 1, { _ => false })
        var s: Int64 = 0
        while (s <= x) {
            if (dp[s]) {
                if (s + a <= x) {
                    ndp[s + a] = true
                }
                if (s + b <= x) {
                    ndp[s + b] = true
                }
            }
            s += 1
        }
        dp = ndp
        i += 1
    }
    if (dp[x]) {
        println("Yes")
    } else {
        println("No")
    }
}
```

</details>
