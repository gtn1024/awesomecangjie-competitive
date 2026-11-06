---
oj: dmy
pid: '525'
title: '[R82C] 取饼干'
difficulty: 普及
tags:
  - 贪心
  - 排序
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le n \le 2\times 10^5$，$1 \le k \le 2\times 10^{14}$，$1 \le a_i \le 10^9$。

## 思路

记当前盘中剩余为 $r$，一位需求为 $x$ 的客人取完后，剩余变成

$$
r-\min\left(x,\left\lfloor\frac r2\right\rfloor\right)=\max\left(r-x,\left\lceil\frac r2\right\rceil\right).
$$

把这一变换记作 $f_x(r)=\max(r-x,\lceil r/2\rceil)$。总共取走的数量是 $k-r_{\text{末}}$，所以 **最大化取走量等价于最小化最终剩余**；又因为最终剩余只取决于每步变换的复合，顺序的影响完全体现在这个复合结果上。

**贪心：按 $a_i$ 从大到小安排客人。**

**相邻交换证明。** 固定当前剩余 $r$，取相邻的两位客人，需求 $a\ge b$。记 $R(a,b)$ 为「先 $a$ 后 $b$」两步之后的剩余。利用 $\lceil\max(u,v)/2\rceil=\max(\lceil u/2\rceil,\lceil v/2\rceil)$ 与 $\max(u,v)-b=\max(u-b,v-b)$，可以把两步复合展开成

$$
R(a,b;r)=\max\left(r-a-b,\ \left\lceil\frac r2\right\rceil-b,\ \left\lceil\frac{r-a}2\right\rceil,\ \left\lceil\frac r4\right\rceil\right),
$$

同理

$$
R(b,a;r)=\max\left(r-a-b,\ \left\lceil\frac r2\right\rceil-a,\ \left\lceil\frac{r-b}2\right\rceil,\ \left\lceil\frac r4\right\rceil\right).
$$

逐项对比第一式的每一项都不超过第二式的最大值：

- $r-a-b$ 与 $\lceil r/4\rceil$ 两项两边相同；
- $\lceil (r-a)/2\rceil\le\lceil (r-b)/2\rceil$，因为 $a\ge b$；
- $\lceil r/2\rceil-b\le\lceil (r-b)/2\rceil$，这由 $\lceil (r-b)/2\rceil+\lceil b/2\rceil\ge\lceil r/2\rceil$ 与 $\lceil b/2\rceil\le b$ 得到。

因此 $R(a,b;r)\le R(b,a;r)$：把需求更大的客人排在前面，两步之后盘中剩余不会更多。又因为 $f_x$ 关于 $r$ 单调不减，剩余更少只会让后面每一步都不劣，所以这次交换不会使答案变差。反复消去「前小后大」的相邻对，最优顺序就是需求降序。

**模拟。** 把 $a$ 降序排序后从左到右依次让客人取：每步 $r\gets\max(r-a_i,\lceil r/2\rceil)$，最后输出 $k-r$。由于 $a_i\ge 1$，一旦 $r\le 1$ 后面每位客人都只能取 $0$，可以提前结束。

注意 $\lceil r/2\rceil=r-\lfloor r/2\rfloor$，实现里直接用整数除法得到 $\lfloor r/2\rfloor$，取走的数量就是 $\min(a_i,\lfloor r/2\rfloor)$。

## 复杂度

排序 $O(n\log n)$，模拟 $O(n)$，总时间 $O(n\log n)$；空间 $O(n)$（存储 $a$）。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

main() {
    let reader = getStdIn()
    let head = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let k = Int64.parse(head[1])
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    sort(a, descending: true)
    var r = k
    for (x in a) {
        let half = r / 2
        if (x < half) {
            r -= x
        } else {
            r -= half
        }
        if (r <= 1) {
            break
        }
    }
    println(k - r)
}
```

</details>
