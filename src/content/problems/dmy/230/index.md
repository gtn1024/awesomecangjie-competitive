---
oj: dmy
pid: '230'
title: '[R38B]连续区间数'
difficulty: 普及
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \leq n \leq 10^6$，$1 \leq l \leq r \leq 10^9$，$1 \leq A_i \leq 10^9$。

## 思路

题目要求找一个连续子段，使得其中所有元素都落在 $[l, r]$ 内，并最大化子段长度。

一个元素是否合法只取决于它自身是否在 $[l, r]$ 内，与其它元素无关。因此可以把数列视作一串「合法 / 非法」的标记，合法元素构成若干连续段，**非法元素**就是段与段之间的天然分隔。答案就是最长的一段连续合法元素的个数。

由此得到一次扫描的做法：维护当前合法段长度 $\text{cur}$ 与全局最大值 $\text{ans}$。从左到右遍历每个 $A_i$：

- 若 $l \leq A_i \leq r$，则 $\text{cur} \leftarrow \text{cur} + 1$，并更新 $\text{ans} \leftarrow \max(\text{ans}, \text{cur})$；
- 否则当前段被打断，$\text{cur} \leftarrow 0$。

无需任何额外数据结构，也不必预处理。

## 复杂度

- 时间 $O(n)$，每个元素只访问一次。
- 空间 $O(n)$，用于存数列本身。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let v = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = v[0]
    let l = v[1]
    let r = v[2]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    var cur: Int64 = 0
    var ans: Int64 = 0
    for (i in 0..n) {
        if (a[i] >= l && a[i] <= r) {
            cur = cur + 1
            if (cur > ans) {
                ans = cur
            }
        } else {
            cur = 0
        }
    }
    println(ans)
}
```

</details>
