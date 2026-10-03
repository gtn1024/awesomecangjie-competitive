---
oj: dmy
pid: '324'
title: '[R52C] REC'
difficulty: 入门
tags:
  - 模拟
  - 前缀和
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le T \le 10$，$1 \le m \le n \le 10^5$，$1 \le a_i,b_i \le 10^9$。

## 思路

设当前序列为 $X=[x_1,x_2,\ldots,x_p]$。

第一种法术先得到

$$
[x_3,x_4,\ldots,x_p,x_1+x_2]
$$

循环右移后变为

$$
[x_1+x_2,x_3,x_4,\ldots,x_p]
$$

所以它等价于直接合并最左侧的两个元素。同理，第二种法术等价于直接合并最右侧的两个元素：

$$
[x_1,x_2,\ldots,x_{p-2},x_{p-1}+x_p]
$$

因此，无论怎样安排法术，左侧的合并只会把 $A$ 的一段前缀变成其元素和，右侧的合并只会把一段后缀变成其元素和，中间没有被合并的元素保持原值与原顺序。

当 $m=1$ 时，所有元素最终都会合并成一个数，所以只需判断

$$
b_1=\sum_{i=1}^{n}a_i
$$

下面考虑 $m\ge 2$。设最终第一个元素由 $A$ 的前 $k$ 个元素合并而成，则最终序列必须恰好为

$$
\left[
\sum_{i=1}^{k}a_i,
a_{k+1},a_{k+2},\ldots,a_{k+m-2},
\sum_{i=k+m-1}^{n}a_i
\right]
$$

其中最后一段至少包含一个元素，即 $k+m-2<n$。

由于所有 $a_i$ 都是正整数，前缀和严格递增，因此满足前缀和等于 $b_1$ 的 $k$ 至多只有一个。依次累加前缀，直到和不小于 $b_1$：

- 若前缀和不等于 $b_1$，答案为 `No`；
- 若剩余元素不足以组成中间的 $m-2$ 个单元素和一个非空后缀，答案为 `No`；
- 否则逐项比较中间元素，并检查剩余后缀之和是否等于 $b_m$。

若这些条件全部成立，先施展 $k-1$ 次第一种法术，再把后缀用第二种法术合并，即可得到 $B$，所以条件也充分。

## 复杂度

每组测试用例的时间复杂度为 $O(n)$，空间复杂度为 $O(n+m)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.console.*
import std.convert.*

func solve(reader: ConsoleReader): Unit {
    let nm = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nm[0]
    let m = nm[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    if (m == 1) {
        var total: Int64 = 0
        for (i in 0..n) {
            total += a[i]
        }
        println(if (total == b[0]) { "Yes" } else { "No" })
        return
    }

    var prefix: Int64 = 0
    var left: Int64 = 0
    while (left < n && prefix < b[0]) {
        prefix += a[left]
        left += 1
    }

    var possible = prefix == b[0] && left + m - 2 < n
    var i: Int64 = 1
    while (possible && i < m - 1) {
        if (a[left + i - 1] != b[i]) {
            possible = false
        }
        i += 1
    }

    var suffix: Int64 = 0
    var j = left + m - 2
    while (possible && j < n) {
        suffix += a[j]
        j += 1
    }
    if (suffix != b[m - 1]) {
        possible = false
    }

    println(if (possible) { "Yes" } else { "No" })
}

main() {
    let reader = Console.stdIn
    let t = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..t) {
        solve(reader)
    }
}
```

</details>
