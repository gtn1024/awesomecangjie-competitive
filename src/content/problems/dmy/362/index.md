---
oj: dmy
pid: '362'
title: '[R58C] 猴子排序'
difficulty: 入门
tags:
  - 模拟
  - 逆序对
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, m \le 2 \times 10^5$，$1 \le a_i, b_i \le n$，$a_i \ne b_i$，$P$ 为排列。

## 思路

关键是要判断「交换 $P_{a_i}$ 与 $P_{b_i}$ 后逆序对是否减少」。设 $a < b$，$x = P_a$，$y = P_b$，记 $c$ 为下标在 $a$ 与 $b$ 之间、且值严格落在 $\min(x, y)$ 与 $\max(x, y)$ 之间的元素个数。交换只影响与位置 $a$、$b$ 有关的逆序对：

- 值小于 $\min(x, y)$ 或大于 $\max(x, y)$ 的中间元素，交换前后与 $x$、$y$ 恰好一增一减，贡献抵消；
- 值落在两者之间的 $c$ 个元素：若 $x < y$，交换前 $x$ 在它们左侧、$y$ 在右侧均不构成逆序对，交换后 $y$ 移到左侧、$x$ 移到右侧各多 $1$ 个，合计 $+2c$；若 $x > y$ 则对称地合计 $-2c$；
- $x$ 与 $y$ 本身：$x < y$ 时交换后 $y$ 在 $x$ 左侧，逆序对 $+1$；$x > y$ 时 $-1$。

于是交换前后逆序对变化量：

$$
\Delta = \begin{cases} 2c + 1 > 0, & x < y \\ -(2c + 1) < 0, & x > y \end{cases}
$$

恒正或恒负，与 $c$ 无关！因此策略退化为：**当且仅当左侧位置的值大于右侧位置的值时交换**。注意 $a_i, b_i$ 没有保证大小关系，先令 $L = \min(a_i, b_i)$，$R = \max(a_i, b_i)$，若 $P_L > P_R$ 则交换，否则不交换；交换后继续模拟即可。最后检查排列是否严格递增。

复杂度：时间 $O(n + m)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let nm = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ q: String => Int64.parse(q) })
    let n = nm[0]
    let m = nm[1]
    let p = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ q: String => Int64.parse(q) })
    let swapped = Array<Bool>(m, { _ => false })
    for (i in 0..m) {
        let ab = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ q: String => Int64.parse(q) })
        let a = ab[0] - 1
        let b = ab[1] - 1
        let l = if (a < b) { a } else { b }
        let r = if (a < b) { b } else { a }
        if (p[l] > p[r]) {
            let t = p[l]
            p[l] = p[r]
            p[r] = t
            swapped[i] = true
        }
    }
    var win = true
    for (i in 1..n) {
        if (p[i] <= p[i - 1]) {
            win = false
            break
        }
    }
    println(if (win) { "Win" } else { "Lose" })
    for (i in 0..m) {
        println(if (swapped[i]) { "Yes" } else { "No" })
    }
    return 0
}
```
