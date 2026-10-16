---
oj: dmy
pid: '500'
title: 跳跃选择
difficulty: 入门
tags:
  - 线性DP
  - 背包DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le N \le 100$，$1 \le X \le 10^4$，$1 \le A_i < B_i \le 100$。

## 思路

**本质是子集和判定的线性 DP。** 设 $\textit{dp}[s]$ 表示处理完前若干次跳跃后，能否恰好到达距离 $s$。初始 $\textit{dp}[0] = \text{true}$，其余为 $\text{false}$。

每读入一次跳跃的两种距离 $A_i$、$B_i$，就做一次转移：对所有可达的 $s$，把 $s + A_i$ 与 $s + B_i$ 标记为可达。用滚动数组避免覆盖，即先复制旧数组，再在新数组上标记。

**超过 $X$ 的状态可以直接丢弃。** 由于 $A_i, B_i \ge 1$，跳跃总距离单调不减，一旦超过 $X$ 便再也不可能回到 $X$。因此只需维护 $0 \le s \le X$ 的范围，数组开 $X + 1$ 即可。

处理完全部 $N$ 次跳跃后，$\textit{dp}[X]$ 即为答案：可达输出 `Yes`，否则输出 `No`。

## 复杂度

时间 $O(NX) \le 10^6$，额外空间 $O(X)$。

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
