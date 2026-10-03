---
oj: dmy
pid: '67'
title: '[R12A] 箭头'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$2 \le n \le 500$。

## 思路

整个图形分成两部分：上半部分是底边长 $2n-1$、高 $n$ 的等腰三角形，第 $i$ 行（$i$ 从 1 开始）有 $n-i$ 个前导空格和 $2i-1$ 个 `#`；下半部分是 $n$ 行「$n-1$ 个空格加一个 `#`」。

逐行直接输出即可，总宽度为 $2n-1$。

复杂度：时间 $O(n^2)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    for (i in 0..n) {
        for (j in 0..(n - 1 - i)) {
            print(" ")
        }
        for (j in 0..(2 * i + 1)) {
            print("#")
        }
        println()
    }
    for (i in 0..n) {
        for (j in 0..(n - 1)) {
            print(" ")
        }
        println("#")
    }
}
```

</details>

要点：

- 第 $i$ 行（$0 \le i < n$）的三角形部分为 $n-1-i$ 个空格加 $2i+1$ 个 `#`，逐个字符直接 `print`、行尾 `println` 输出。
- 区间 `0..k` 不含右端点，行首空格数为 0 时循环体不执行，恰好对应最后一行无前导空格的情况。
