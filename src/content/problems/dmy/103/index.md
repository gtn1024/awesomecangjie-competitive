---
oj: dmy
pid: '103'
title: '[R18A]挑食'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$，$1 \le x, a_i, b_i \le 1000$，$a_i \ne b_i$。

## 思路

一道菜只要使用了食材 $x$，`apiadu` 就不喜欢它。逐道菜读取 $(a_i, b_i)$，若 $a_i = x$ 或 $b_i = x$ 就把计数器加一，最后输出计数器即可。

## 复杂度

时间 $O(n)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.console.*
import std.convert.*

main() {
    let reader = Console.stdIn
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = line[0]
    let x = line[1]
    var cnt = 0
    for (_ in 0..n) {
        let ab = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        if (ab[0] == x || ab[1] == x) {
            cnt++
        }
    }
    println(cnt)
}
```

</details>
