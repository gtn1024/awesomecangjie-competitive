---
oj: dmy
pid: '497'
title: 选择元素
difficulty: 普及−
tags:
  - 线性DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le N \le 2\times 10^5$，$0 \le K \le 10^9$，$1 \le A_i, B_i \le 10^9$。

## 思路

每个位置只有两种选法，合法性约束只作用在相邻两个位置之间，于是可以逐位递推「当前位取某个值时，前面是否已经形成合法前缀」。

设 $f_i$ 表示存在一种前缀选法，使第 $i$ 位选 $A_i$ 且前 $i$ 位两两相邻的差都不超过 $K$；$g_i$ 同理表示第 $i$ 位选 $B_i$。显然 $f_1 = g_1 = \text{true}$（只有一个位置时没有任何相邻对需要检查）。

转移就是把上一位的两种可能都试一遍：

$$f_i = \bigl(f_{i-1} \wedge |A_i - A_{i-1}| \le K\bigr) \vee \bigl(g_{i-1} \wedge |A_i - B_{i-1}| \le K\bigr),$$

$$g_i = \bigl(f_{i-1} \wedge |B_i - A_{i-1}| \le K\bigr) \vee \bigl(g_{i-1} \wedge |B_i - B_{i-1}| \le K\bigr).$$

答案就是 $f_N \vee g_N$。

由于转移只用到上一位的两个布尔值，不必开 $O(N)$ 的 DP 数组，读入数组后用两个变量滚动即可；一旦两个状态同时为假，后面不可能再恢复，直接跳出循环输出 `No`。

绝对值展开成 $d \le K$ 且 $d \ge -K$ 两个比较，避免依赖额外的库函数；$A_i, B_i \le 10^9$，差值在 `Int64` 范围内安全。

> 注：题面样例 2 给出 $A = (1, 10)$、$B = (10, 1)$、$K = 1$，取 $A_1 = 1$、$B_2 = 1$ 差为 $0$，合法，答案应为 `Yes`，题面所写的 `No` 有误。本题评测数据中该组数据的正确答案为 `Yes`。

## 复杂度

时间 $O(N)$，空间 $O(N)$（存读入的两个数组）。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let nk = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nk[0]
    let k = nk[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    var ca = true
    var cb = true
    var i: Int64 = 1
    while (i < n && (ca || cb)) {
        var na = false
        var nb = false
        if (ca) {
            let d = a[i] - a[i - 1]
            if (d <= k && d >= -k) { na = true }
            let e = b[i] - a[i - 1]
            if (e <= k && e >= -k) { nb = true }
        }
        if (cb) {
            let d = a[i] - b[i - 1]
            if (d <= k && d >= -k) { na = true }
            let e = b[i] - b[i - 1]
            if (e <= k && e >= -k) { nb = true }
        }
        ca = na
        cb = nb
        i += 1
    }
    if (ca || cb) {
        println("Yes")
    } else {
        println("No")
    }
}
```

</details>
