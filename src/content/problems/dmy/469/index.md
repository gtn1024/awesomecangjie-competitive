---
oj: dmy
pid: '469'
title: '[R76A] 还是灯'
difficulty: 入门
tags:
  - 数学
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$0 \le A,B \le 100$，$1 \le S \le 100$。

## 思路

两盏灯的总亮度为 $A+B$，相机最多只能记录 $S$。

- 若 $A+B \le S$，所有亮度都被记录，溢出为 $0$；
- 若 $A+B > S$，记录亮度为 $S$，超出部分是 $A+B-S$。

即记录亮度为 $\min(A+B,S)$，溢出亮度为 $\max(0,A+B-S)$，直接计算输出即可。由于 $A,B \le 100$，答案不超过 $200$，不会溢出。

## 复杂度

时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let a = parts[0]
    let b = parts[1]
    let s = parts[2]
    let total = a + b
    let recorded = if (total < s) { total } else { s }
    let overflow = if (total > s) { total - s } else { 0 }
    println("${recorded} ${overflow}")
}
```

</details>
