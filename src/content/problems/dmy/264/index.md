---
oj: dmy
pid: '264'
title: '[R43B]序列(Easy ver.)'
difficulty: 普及
tags:
  - 线段树
  - 区间查询
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, q \le 5 \times 10^3$，$0 \le k, a_i \le 10^9$，$1 \le l \le r \le n$。

## 思路

每次询问只需要知道区间 $[l,r]$ 中的最小值与最大值。建立一棵线段树，每个节点同时维护其对应区间的最小值和最大值：

$$
\operatorname{mn}_u=\min(\operatorname{mn}_{2u},\operatorname{mn}_{2u+1}),\qquad
\operatorname{mx}_u=\max(\operatorname{mx}_{2u},\operatorname{mx}_{2u+1})。
$$

令 `base` 为不小于 $n$ 的最小二次幂，把原序列放在线段树的叶子上。多出的叶子不属于原序列，将其最小值设为 $10^9+1$、最大值设为 $0$，这样它们不会影响合并结果。

查询时把左右端点移动到叶子层。若左端点是右儿子，它对应的整段必须计入答案，然后令左端点右移；若右端点是左儿子，同理计入并令右端点左移。之后两个端点一起上移到父节点，直到区间为空。这样取出的节点对应若干互不相交的区间，它们恰好覆盖询问区间。

设查询得到的最大值和最小值分别为 $\operatorname{mx}$、$\operatorname{mn}$。当且仅当

$$
\operatorname{mx}-\operatorname{mn}\le k
$$

时，该区间是好序列。

## 正确性证明

线段树的每个叶子保存一个原序列元素。对于任意内部节点，按上述转移分别取两个儿子最小值的较小者、最大值的较大者，所以由归纳可知，该节点保存的正是其对应区间的最小值与最大值。

一次查询选出的线段树节点两两不交，并且恰好覆盖 $[l,r]$。合并这些节点保存的信息，得到的就是整个询问区间的最小值与最大值。因此程序判断的 $\operatorname{mx}-\operatorname{mn}\le k$ 与好序列的定义完全相同，输出一定正确。

## 复杂度

建树时间为 $O(n)$，每次询问时间为 $O(\log n)$，总时间复杂度为 $O(n+q\log n)$；空间复杂度为 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let q = first[1]
    let k = first[2]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    var base: Int64 = 1
    while (base < n) {
        base *= 2
    }
    let minimum = Array<Int64>(base * 2, { _ => 1000000001 })
    let maximum = Array<Int64>(base * 2, { _ => 0 })

    var i: Int64 = 0
    while (i < n) {
        minimum[base + i] = a[i]
        maximum[base + i] = a[i]
        i += 1
    }
    i = base - 1
    while (i > 0) {
        let left = i * 2
        let right = left + 1
        if (minimum[left] < minimum[right]) {
            minimum[i] = minimum[left]
        } else {
            minimum[i] = minimum[right]
        }
        if (maximum[left] > maximum[right]) {
            maximum[i] = maximum[left]
        } else {
            maximum[i] = maximum[right]
        }
        i -= 1
    }

    var query: Int64 = 0
    while (query < q) {
        let bounds = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        var left = base + bounds[0] - 1
        var right = base + bounds[1] - 1
        var currentMinimum: Int64 = 1000000001
        var currentMaximum: Int64 = 0
        while (left <= right) {
            if (left % 2 == 1) {
                if (minimum[left] < currentMinimum) {
                    currentMinimum = minimum[left]
                }
                if (maximum[left] > currentMaximum) {
                    currentMaximum = maximum[left]
                }
                left += 1
            }
            if (right % 2 == 0) {
                if (minimum[right] < currentMinimum) {
                    currentMinimum = minimum[right]
                }
                if (maximum[right] > currentMaximum) {
                    currentMaximum = maximum[right]
                }
                right -= 1
            }
            left /= 2
            right /= 2
        }
        if (currentMaximum - currentMinimum <= k) {
            println("Yes")
        } else {
            println("No")
        }
        query += 1
    }
}
```

</details>
