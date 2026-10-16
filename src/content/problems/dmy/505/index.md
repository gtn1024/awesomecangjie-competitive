---
oj: dmy
pid: '505'
title: 回家的路
difficulty: 入门
tags:
  - 线性DP
  - 单调队列
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$2 \le n \le 100$，$1 \le d \le n$，字符串 $s$ 长度为 $n$，只含 0 和 1，首尾字符均为 1。

## 思路

设 $dp[i]$ 表示从位置 1 跳到位置 $i$ 所需的最少跳跃次数，无法到达时为 $\infty$。初始 $dp[1] = 0$。

位置 $i$ 只能从 $i-d,\ i-d+1,\ \dots,\ i-1$ 中的落脚点跳来，因此转移为

$$dp[i] = \min_{\substack{i-d \le j < i \\ s_j = 1}} dp[j] + 1.$$

也就是说，每处理一个 $i$，只需要查询**滑动窗口** $[i-d,\ i-1]$ 内所有落脚点中 $dp$ 值的最小值。用**单调队列**维护这个窗口：队首始终是 $dp$ 最小且未滑出窗口的下标，处理 $i$ 时先把队首超出窗口的元素弹出，再取队首转移；随后把 $i$ 从队尾插入，插入前弹出队尾所有 $dp$ 值不小于 $dp[i]$ 的元素，保证队列中 $dp$ 值单调递增。

只有 $s_i = 1$ 的位置才能落脚，因此 $s_i = 0$ 的位置直接跳过（不转移、不入队），$s_i = 1$ 且队列为空说明窗口内没有落脚点，$dp[i]$ 保持 $\infty$。最终若 $dp[n] = \infty$ 输出 -1，否则输出 $dp[n]$。

## 复杂度

时间 $O(n)$，额外空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(first[0])
    let d = Int64.parse(first[1])
    let s = reader.readln().getOrThrow()
    let INF: Int64 = 1000000000
    let nn = n
    let dp = Array<Int64>(nn + 1, { _ => INF })
    let dq = Array<Int64>(nn + 1, { _ => 0 })
    var head: Int64 = 0
    var tail: Int64 = 0
    dp[1] = 0
    dq[tail] = 1
    tail += 1
    var i: Int64 = 2
    while (i <= n) {
        if (s[i - 1] == 49) {
            while (head < tail && dq[head] < i - d) {
                head += 1
            }
            if (head < tail) {
                dp[i] = dp[dq[head]] + 1
            }
            while (head < tail && dp[dq[tail - 1]] >= dp[i]) {
                tail -= 1
            }
            dq[tail] = i
            tail += 1
        }
        i += 1
    }
    if (dp[n] >= INF) {
        println(-1)
    } else {
        println(dp[n])
    }
}
```

</details>
