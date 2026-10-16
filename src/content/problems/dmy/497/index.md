---
oj: dmy
pid: '497'
title: 选择元素
difficulty: 入门
tags:
  - 线性DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le N \le 2 \times 10^5$，$0 \le K \le 10^9$，$1 \le A_i, B_i \le 10^9$。

## 思路

每个位置只有两个选择，且位置 $i$ 是否合法只取决于位置 $i-1$ 选了哪个数，是典型的线性 DP。

**状态定义：** $f_A(i)$ 表示位置 $i$ 选择 $A_i$ 时，前 $i$ 个位置是否存在合法方案；$f_B(i)$ 同理表示选择 $B_i$。初值 $f_A(1) = f_B(1) = \text{true}$。

**转移方程：**

$$f_A(i) = \big(f_A(i-1) \land |A_i - A_{i-1}| \le K\big) \lor \big(f_B(i-1) \land |A_i - B_{i-1}| \le K\big)$$

$$f_B(i) = \big(f_A(i-1) \land |B_i - A_{i-1}| \le K\big) \lor \big(f_B(i-1) \land |B_i - B_{i-1}| \le K\big)$$

即：当前选某个数，当且仅当上一个位置至少存在一种可行选择，且与它的差不超过 $K$。

**答案：** $f_A(N) \lor f_B(N)$，任一为真输出 `Yes`，否则输出 `No`。

每个位置只有两个布尔状态，滚动维护即可。

## 复杂度

时间 $O(N)$，额外空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

func abs64(x: Int64): Int64 {
    if (x < 0) {
        return -x
    }
    return x
}

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let k = first[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    var okA = true
    var okB = true
    for (i in 1..n) {
        let na = (okA && abs64(a[i] - a[i - 1]) <= k) || (okB && abs64(a[i] - b[i - 1]) <= k)
        let nb = (okA && abs64(b[i] - a[i - 1]) <= k) || (okB && abs64(b[i] - b[i - 1]) <= k)
        okA = na
        okB = nb
    }
    if (okA || okB) {
        println("Yes")
    } else {
        println("No")
    }
}
```

</details>
