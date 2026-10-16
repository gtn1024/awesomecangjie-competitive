---
oj: dmy
pid: '504'
title: 长跳跃
difficulty: 入门
tags:
  - 线性DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le T \le 1000$，所有测试用例的 $n$ 之和不超过 $2 \times 10^5$，$1 \le a_i \le n$。

## 思路

**倒序 DP。** 设 $dp[i]$ 表示从第 $i$ 个格子出发能获得的总分。从 $i$ 起跳必然获得 $a_i$ 分，落点是 $i + a_i$：

- 若 $i + a_i \le n$，落到格子 $i + a_i$ 后还能继续跳，$dp[i] = a_i + dp[i + a_i]$；
- 若 $i + a_i > n$，训练立即结束，但本次跳跃的 $a_i$ 分照拿，$dp[i] = a_i$。

转移只依赖下标更大的状态，所以从 $n$ 到 $1$ 倒序计算即可保证无后效性。由于 $a_i \ge 1$，每个 $dp[i]$ 的转移目标唯一，整张图是一组互不相交的链，倒序一遍就能扫完。答案为 $\max_{i} dp[i]$。

## 复杂度

时间 $O(n)$，额外空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

func solve(reader: ConsoleReader): Unit {
    let n = Int64.parse(reader.readln().getOrThrow())
    let nn = n
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({
        p: String => Int64.parse(p)
    })
    let dp = Array<Int64>(nn + 1, { _ => 0 })
    var best: Int64 = 0
    var i: Int64 = nn
    while (i >= 1) {
        var v = a[i - 1]
        let j = i + a[i - 1]
        if (j <= nn) {
            v += dp[j]
        }
        dp[i] = v
        if (v > best) {
            best = v
        }
        i -= 1
    }
    println(best)
}

main() {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    var k: Int64 = 0
    while (k < t) {
        solve(reader)
        k += 1
    }
}
```

</details>
