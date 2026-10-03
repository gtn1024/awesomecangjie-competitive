---
oj: dmy
pid: '257'
title: '[R42B]前导0'
difficulty: 入门
tags:
  - 字符串
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le m \le n \le 100$，$a$ 是一个无前导零的 $m$ 位正整数。

## 思路

由于 $a$ 最多有 $100$ 位，不能将它作为整数处理，直接保留其字符串形式。

目标串需要恰好有 $n$ 位，而 $a$ 已有 $m$ 位，所以先连续加入 $n - m$ 个 `0`，再接上原字符串 $a$。这样得到的字符串长度为 $n$，且后缀完全保留原数，正是所求结果。

## 复杂度

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(parts[0])
    let m = Int64.parse(parts[1])
    let a = parts[2]

    var i = m
    while (i < n) {
        print("0")
        i += 1
    }
    println(a)
}
```

</details>
