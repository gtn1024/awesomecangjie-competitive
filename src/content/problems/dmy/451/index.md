---
oj: dmy
pid: '451'
title: '[R73A] 小方块'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$T \le 10^4$，$n \le 10^3$。

## 思路

$n$ 阶魔方是一个 $n \times n \times n$ 的立方体，只有位于最外层、至少有一个面露在外面的小立方体才是小方块。

- $n = 1$ 时没有内部区域，整个魔方就是一个小方块，答案为 $1$；
- $n \ge 2$ 时，内部被挖空的核心是边长为 $n-2$ 的立方体，小方块数为外层立方体减去内部空心核心：

$$n^3 - (n-2)^3$$

$n \le 10^3$，$n^3 \le 10^9$，用 `Int64` 计算即可，无需取模。

## 复杂度

每组数据 $O(1)$ 时间、$O(1)$ 空间。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..t) {
        let n = Int64.parse(reader.readln().getOrThrow())
        if (n == 1) {
            println(1)
        } else {
            println(n * n * n - (n - 2) * (n - 2) * (n - 2))
        }
    }
}
```

</details>