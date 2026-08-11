---
oj: dmy
pid: '144'
title: '[R24C]开关控制'
difficulty: 提高
tags:
  - 数学
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $40\%$ 的数据，$1 \leq k \leq 10^6$；对于 $100\%$ 的数据，$2 \leq n \leq 10^5$，$1 \leq k \leq 10^9$。

## 思路

两个机器人都在 $1 \sim n$ 之间往返，运动周期均为 $T = 2(n-1)$。在第 $0$ 秒按下起点开关，之后每秒移动一步并按下新位置的开关，因此从第 $0$ 秒到第 $k$ 秒共有 $k+1$ 次操作。

考虑机器人 1 的位置序列：$1, 2, \dots, n, n-1, \dots, 2, 1, 2, \dots$，正好是一个长度为 $T$ 的周期。机器人 2 从 $n$ 出发、方向相反，但其位置序列恰好是机器人 1 位置的「镜像」——在任意时刻 $t$，机器人 2 的位置 $= n+1 - (\text{机器人 1 在 } t \text{ 的位置})$。于是开关 $i$ 被按下的总次数为

$$\text{cnt}[i] = g(i) + g(n+1-i),$$

其中 $g(i)$ 是机器人 1 在 $k+1$ 个时刻里经过位置 $i$ 的次数。

**关键观察**：一个完整周期对每个位置的贡献总是偶数次（端点 $1$、$n$ 每周期各 $1$ 次，中间位置每周期各 $2$ 次，累加到两个机器人后均为偶数）。因此完整周期不改变任何开关状态的奇偶性，只需考察余下 $m = (k+1) \bmod T$ 个时刻（$t = 0, 1, \dots, m-1$）。

在这余下的 $m$ 个时刻里，机器人 1 的轨迹为 $1, 2, \dots$，最多走到位置 $\min(m, n)$；当 $m > n$ 时，已经掉头，会再次覆盖中间位置 $[2n-m,\ n-1]$。因此：

- 上升段：位置 $i \leq \min(m, n)$ 时 $g(i)$ 加 $1$；
- 下降段：当 $m > n$ 且 $2 \leq i \leq n-1$ 且 $i \geq 2n-m$ 时 $g(i)$ 再加 $1$。

求出 $g(i)$ 与 $g(n+1-i)$ 后，若二者之和为奇数则该开关处于开启状态。统计所有奇数 cnt 的个数即为答案。

当 $m = 0$（即 $k+1$ 恰为周期整数倍）时，所有开关都被按偶数次，答案为 $0$。

## 复杂度

- 时间：$O(n)$，对每个开关 $O(1)$ 计算。
- 空间：$O(1)$，无需存储数组。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(parts[0])
    let k = Int64.parse(parts[1])
    let T = 2 * (n - 1)
    let total = k + 1
    let m = total % T
    if (m == 0) {
        println("0")
        return 0
    }
    // g(i): robot1 visits to position i during remainder moments t=0..m-1.
    // Position path over one period: 1,2,...,n,n-1,...,2 (length T).
    // Ascending phase covers positions [1, min(m,n)]; descending phase (m>n)
    // covers interior positions [2n-m, n-1] once more.
    let ascMax = if (m < n) { m } else { n }
    let descLo = 2 * n - m
    var ans: Int64 = 0
    for (i in 1..n + 1) {
        var gi: Int64 = 0
        if (i <= ascMax) {
            gi += 1
        }
        if (i >= 2 && i <= n - 1 && m > n && i >= descLo) {
            gi += 1
        }
        let j = n + 1 - i
        var gj: Int64 = 0
        if (j <= ascMax) {
            gj += 1
        }
        if (j >= 2 && j <= n - 1 && m > n && j >= descLo) {
            gj += 1
        }
        if (((gi + gj) % 2) != 0) {
            ans += 1
        }
    }
    println(ans)
    return 0
}
```
