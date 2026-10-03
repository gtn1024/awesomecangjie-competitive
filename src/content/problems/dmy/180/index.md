---
oj: dmy
pid: '180'
title: '[R30A]机器人移动2'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le |s| \le 100$，$s$ 只包含 `U`、`D`、`L`、`R`。

## 思路

按题意从 $(0, 0)$ 出发，依次处理指令字符串中的每个字符，用两个变量维护当前坐标：遇到 `U`/`D` 就对 $y$ 加减 1，遇到 `L`/`R` 就对 $x$ 加减 1。处理完整串指令后输出最终的 $(x, y)$ 即可。

由于仓颉中 `for (ch in s)` 遍历字符串得到的是 UTF-8 字节（`UInt8`），直接用 ASCII 码值（`85u8` 对应 `U` 等）来比较分支即可。

## 复杂度

时间 $O(|s|)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*

main() {
    let reader = getStdIn()
    let s = reader.readln().getOrThrow()
    var x: Int64 = 0
    var y: Int64 = 0
    for (b in s) {
        if (b == 85u8) {       // 'U'
            y += 1
        } else if (b == 68u8) { // 'D'
            y -= 1
        } else if (b == 76u8) { // 'L'
            x -= 1
        } else if (b == 82u8) { // 'R'
            x += 1
        }
    }
    println("${x} ${y}")
}
```

</details>
