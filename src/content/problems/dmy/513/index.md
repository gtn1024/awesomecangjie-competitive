---
oj: dmy
pid: '513'
title: '[R80B] 发糖果'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

## 数据规模

$1 \le n \le 10^6$，$0 \le s < \dfrac{n(n+1)}{2}$，保证答案存在。总量 $\dfrac{n(n+1)}{2}$ 最大约为 $5 \times 10^{11}$，超出 32 位整数范围，需要用 64 位整数保存。

## 思路

**算出全场应发的总量。** 若没有同学缺席，按计划编号为 $i$ 的同学应得 $i$ 颗糖，总量为

$$
1 + 2 + \cdots + n = \frac{n(n+1)}{2}.
$$

**用实际发出的量做差。** 实际发出去的 $s$ 颗糖，恰好是总量减去缺席同学那 $x$ 颗，多出的部分就是缺席同学的编号：

$$
x = \frac{n(n+1)}{2} - s.
$$

题目保证答案存在，因此差值必然落在 $1 \sim n$ 内，直接输出即可，无需额外判断。

## 复杂度

时间与空间均为 $O(1)$，只涉及一次读入和一次整数运算。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = parts[0]
    let s = parts[1]
    println(n * (n + 1) / 2 - s)
}
```

</details>
