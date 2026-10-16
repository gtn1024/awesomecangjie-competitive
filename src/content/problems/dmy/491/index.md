---
oj: dmy
pid: '491'
title: '[R79D] 分装'
difficulty: 提高
tags:
  - 排序
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2\times10^5$，$1 \le M \le 10^{18}$，$0 \le a_i,b_i \le 10^{18}$。

## 思路

把 $a$ 降序排序得到 $A$，把 $b$ 降序排序得到 $B$。由于 $\lfloor\cdot/d\rfloor$ 单调不减，$\lfloor A_1/d\rfloor \ge \lfloor A_2/d\rfloor \ge \cdots$，所以 $c$ 降序排序后的第 $k$ 项恰为 $\lfloor A_k/d\rfloor$。

**两个多重集合相等，当且仅当降序排序后逐项相等。** 因此 $d$ 合法当且仅当对每个位置 $k$ 都有

$$\left\lfloor \frac{A_k}{d} \right\rfloor = B_k \iff \frac{A_k}{B_k+1} < d \le \frac{A_k}{B_k}.$$

（当 $B_k=0$ 时只有左半边约束 $d>A_k$，右端视为 $+\infty$。）

**每个位置给出一段关于 $d$ 的整数区间，$n$ 段区间的交仍是一个区间。** 取所有左端点的最大值与所有右端点的最小值（右端点再与 $M$ 取最小）：

$$L = \max_k \left\lfloor \frac{A_k}{B_k+1} \right\rfloor,\qquad R = \min\left(M,\ \min_{k:\,B_k\ge 1}\left\lfloor \frac{A_k}{B_k} \right\rfloor\right).$$

合法容量恰好是满足 $L < d \le R$ 的整数，个数为 $\max(0, R-L)$。全 $b_i=0$ 的特殊性质也被自然覆盖：此时 $R=M$、$L=\max a_i$，即 $d>\max a_i$ 的所有容量都合法。

## 复杂度

排序 $O(n \log n)$，扫描求交 $O(n)$；额外空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

main() {
    let reader = getStdIn()
    let nm = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nm[0]
    let m = nm[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    sort(a, descending: true)
    sort(b, descending: true)
    var lo: Int64 = 0
    var hi: Int64 = m
    for (i in 0..n) {
        let x = a[i] / (b[i] + 1)
        if (x > lo) {
            lo = x
        }
        if (b[i] >= 1) {
            let y = a[i] / b[i]
            if (y < hi) {
                hi = y
            }
        }
    }
    var ans = hi - lo
    if (ans < 0) {
        ans = 0
    }
    println(ans)
}
```

</details>
