---
oj: dmy
pid: '560'
title: '挑战塔'
difficulty: 普及+
tags:
  - 线性 DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le t \le 2\times 10^4$，$1 \le n \le 2\times 10^5$，同一输入中所有测试用例的 $n$ 之和不超过 $2\times 10^5$，$a_i \in \{0,1\}$。

## 思路

**先确定「最少」在问什么。** 题目要的是朋友消耗点数的最小值，而蜗蜗击败任何 Boss 都不消耗，所以蜗蜗的每一步都不会增加代价，两人的目标是一致的：一起把朋友的消耗压到最低。样例 1 的第二组数据里，朋友先击败第 $1$ 个 Boss、蜗蜗接着击败第 $2$、$3$ 个，就体现了这种配合。

**状态。** 由于不能越过尚未击败的 Boss，任何时刻「已经打到哪」都只是一个后缀的起点；再加上当前轮到谁，就完全决定了后面的过程。于是定义：

- $dp_0(i)$：第 $i$ 个到第 $n$ 个 Boss 尚未击败、轮到朋友行动时，朋友之后至少要消耗的点数；
- $dp_1(i)$：同样的局面下轮到蜗蜗行动时，朋友之后至少要消耗的点数。

下标从 $0$ 开始，答案即 $dp_0(0)$。

**转移。** 行动者只能在剩下的序列里击败接下来的 $1$ 个或 $2$ 个 Boss：

$$dp_0(i)=\min\Bigl(a_i+dp_1(i+1),\ a_i+a_{i+1}+dp_1(i+2)\Bigr),$$

$$dp_1(i)=\min\bigl(dp_0(i+1),\ dp_0(i+2)\bigr).$$

朋友那一行两项分别是取 $1$ 个、取 $2$ 个（仅当 $i<n-1$ 时第二项合法），代价是这段里困难 Boss 的个数，之后轮到蜗蜗。蜗蜗那一行不加任何代价，只在两种取法里挑对朋友更有利的一种。

**为什么这样递推是对的。** 剩下的局面由后缀起点 $i$ 与当前行动者唯一确定，与之前谁怎么打无关，满足无后效性；每个状态把行动者所有合法选择都枚举了一遍，且各自递归到更小的后缀，所以从后往前递推得到的就是真正的最优值。

**边界。** $i=n$ 表示 Boss 已全部击败，$dp_0(n)=dp_1(n)=0$。实现里把数组开到 $n+2$ 位并全部初始化为 $0$：下标 $i+2$ 最多取到 $n+1$ 不会越界，而多出的那一格填 $0$ 与「已全部击败」一致，所以蜗蜗在只剩一个 Boss 时算上「取两个」也不会得到更差的值。朋友取 $2$ 个的转移则必须保证 $i+1<n$，否则只剩一个 Boss，实现里显式判断。

**极端情形。** 全部为简单 Boss 时答案恒为 $0$；全部为困难 Boss 时，朋友负责的每一轮都会消耗点数，例如 $n=5$ 时最优是「朋友取 $1$ 个、蜗蜗取 $2$ 个、朋友取 $1$ 个、蜗蜗取 $1$ 个」，答案为 $2$。

## 复杂度

每组数据只需从后往前扫一遍，时间 $O(n)$，空间 $O(n)$；对全部数据求和即 $O\bigl(\sum n\bigr)$ 时间。

## 仓颉实现

用两个长度为 $n+2$ 的数组按下标从大到小递推，末尾多开的位置天然为 $0$，正好对应「已经打完」的边界。

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

func solve() {
    let n = Int64.parse(getStdIn().readln().getOrThrow())
    let a = getStdIn().readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let m = n + 2
    let d0 = Array<Int64>(m, { _ => 0 })
    let d1 = Array<Int64>(m, { _ => 0 })
    var i = n - 1
    while (i >= 0) {
        var best = a[i] + d1[i + 1]
        if (i + 1 < n) {
            let c = a[i] + a[i + 1] + d1[i + 2]
            if (c < best) {
                best = c
            }
        }
        d0[i] = best
        d1[i] = if (d0[i + 1] < d0[i + 2]) { d0[i + 1] } else { d0[i + 2] }
        i -= 1
    }
    println(d0[0])
}

main() {
    let t = Int64.parse(getStdIn().readln().getOrThrow())
    var k = 0
    while (k < t) {
        solve()
        k += 1
    }
}
```

</details>
