---
oj: dmy
pid: '256'
title: '[R42A] 比较'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：字符串长度固定为 $3$，格式为 `x<y`、`x=y` 或 `x>y`，其中 $x$、$y$ 是数字字符。

## 思路

将字符串转为字符数组。首尾两个字符都是数字，字符编码的大小顺序与数字大小顺序相同；中间字符则唯一确定需要检验的关系。

- 中间字符为 `<` 时，判断左侧是否小于右侧；
- 中间字符为 `=` 时，判断两侧是否相等；
- 否则判断左侧是否大于右侧。

成立时输出 `Yes`，否则输出 `No`。

复杂度：时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*

main() {
    let reader = getStdIn()
    let s = reader.readln().getOrThrow().toRuneArray()
    let x = UInt32(s[0])
    let y = UInt32(s[2])
    var ok = false
    if (s[1] == r'<') {
        ok = x < y
    } else if (s[1] == r'=') {
        ok = x == y
    } else {
        ok = x > y
    }
    if (ok) {
        println("Yes")
    } else {
        println("No")
    }
}
```

</details>
