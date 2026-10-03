---
oj: dmy
pid: '331'
title: '[R53D] 数组积'
difficulty: 普及-
tags:
  - 贪心
  - 前缀和
  - 排序
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$0 \le m \le 10^9$，$-10^4 \le a_i,b_i \le 10^4$，$0 \le c_i \le 10^4$。

## 思路

先计算初始数组积

$$
P_0=\sum_{j=1}^{n}a_jb_j
$$

记数组 $b$ 的前缀和为

$$
S_i=\sum_{j=1}^{i}b_j
$$

若选择下标 $i$ 执行一次加法操作，只有 $a_1,a_2,\ldots,a_i$ 各增加 $1$，因此数组积增加 $S_i$；执行一次减法操作时，数组积增加 $-S_i$。

每次操作都可以独立选择加法或减法，所以选择下标 $i$ 时，总能选取更优的方向，使这次操作对答案的增量为

$$
g_i=|S_i|
$$

这样，原问题转化为：第 $i$ 类物品有 $c_i$ 个，每个价值为 $g_i$，从所有物品中选择至多 $m$ 个，使总价值最大。

将所有下标按照 $g_i$ 从大到小排序，然后依次取出

$$
\min(c_i,\text{剩余操作次数})
$$

次操作即可。如果所有下标的次数上限之和小于 $m$，就取完所有操作；由于每次操作的最优增量都非负，不会使答案变小。

## 正确性证明

对于任意下标 $i$，一次加法操作对数组积的改变量为 $S_i$，一次减法操作的改变量为 $-S_i$。算法选择其中较大的一个，因此每次选择下标 $i$ 都能获得且最多获得 $g_i=|S_i|$ 的增量。

考虑任意一个满足限制的最优方案。若它选择了下标 $y$ 的一次操作，而某个下标 $x$ 仍有可用次数且 $g_x>g_y$，则用下标 $x$ 的一次操作替换它，不会改变操作总数，也不会违反任何下标的次数限制，却会使总增量增加 $g_x-g_y>0$。这与原方案最优矛盾。

因此，存在一个最优方案会在仍有操作名额时，总是优先选择尚未达到次数上限且增量最大的下标。算法正是按照这个顺序贪心选择，并在达到 $m$ 次或用完所有可用操作时停止，所以得到的额外增量最大。加上初始数组积 $P_0$ 后，输出即为题目要求的最大数组积。

## 复杂度

计算前缀和需要 $O(n)$ 时间，排序需要 $O(n\log n)$ 时间，因此总时间复杂度为 $O(n\log n)$，空间复杂度为 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*
import std.sort.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    var remaining = first[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let c = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    var answer: Int64 = 0
    let gain = Array<Int64>(n, { _ => 0 })
    var prefix: Int64 = 0
    for (i in 0..n) {
        answer += a[i] * b[i]
        prefix += b[i]
        gain[i] = if (prefix >= 0) { prefix } else { -prefix }
    }

    let order = Array<Int64>(n, { i => i })
    sort(order, key: { i: Int64 => gain[i] }, descending: true)
    for (i in order) {
        if (remaining == 0) {
            break
        }
        let take = if (c[i] < remaining) { c[i] } else { remaining }
        answer += take * gain[i]
        remaining -= take
    }
    println(answer)
}
```

</details>
