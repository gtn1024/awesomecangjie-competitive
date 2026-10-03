---
oj: dmy
pid: '309'
title: '[R50A]缺失的数'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le x < n \le 1000$，剩余的 $n-x$ 个数字互不相同且均在 $1$ 到 $n$ 之间。

## 思路

原数组是 $1, 2, \dots, n$，被删除了 $x$ 个数。题目要求找出这些被删除的数并按升序输出。

开一个布尔数组 $\textit{present}[1..n]$，初始全为 $\text{false}$，把给定的 $n-x$ 个数对应的下标标记为 $\text{true}$。随后从 $1$ 到 $n$ 顺序扫描，凡是 $\textit{present}[i]=\text{false}$ 的 $i$ 就是缺失的数，自然按升序得到，直接输出即可。

## 复杂度

时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let v = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = v[0]
    let x = v[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let present = Array<Bool>(Int64(n) + 1, { _ => false })
    for (val in a) {
        present[Int64(val)] = true
    }
    var first = true
    var i = Int64(1)
    while (i <= n) {
        if (!present[i]) {
            if (!first) {
                print(" ")
            }
            print(i)
            first = false
        }
        i++
    }
    println()
}
```

</details>
