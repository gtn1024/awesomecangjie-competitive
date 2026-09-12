---
oj: dmy
pid: '252'
title: '[R41C]文本编辑器'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le |S| \le 5 \times 10^5$，字符串 $S$ 中仅包含小写字母、`#` 和 `@`。

## 思路

按照题意直接模拟即可。维护两个状态：

- 一个布尔变量 `upper` 记录键盘当前是否处于大写模式，初始为 `false`；
- 一个动态数组 `result` 保存屏幕上当前的字符。

从左到右逐个处理 $S$ 中的字节：

1. 遇到小写字母时，根据 `upper` 决定输出小写形式或大写形式（大写比小写的 ASCII 值小 $32$），追加到 `result` 末尾。
2. 遇到 `@` 时，翻转大小写模式（不向屏幕追加任何字符）。
3. 遇到 `#` 时，若 `result` 非空则删除末尾字符；否则什么都不做。**注意** `#` 不改变大小写模式。

处理结束后将 `result` 拼成字符串输出即可。每个字符最多被追加一次、删除一次，因此总操作量为 $O(|S|)$。

## 复杂度

- 时间复杂度：$O(|S|)$，单次遍历。
- 空间复杂度：$O(|S|)$，用于保存屏幕内容。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*
import std.collection.*

main() {
    let reader = getStdIn()
    // 读取 n（题目固定格式，单整数）
    let _ = Int64.parse(reader.readln().getOrThrow())
    // 读取字符串 S，按字节遍历
    let s = reader.readln().getOrThrow()

    var upper = false
    let result = ArrayList<UInt8>()

    for (b in s) {
        if (b == 64u8) { // '@'
            upper = !upper
        } else if (b == 35u8) { // '#'
            if (result.size > 0) {
                result.remove(at: result.size - 1)
            }
        } else { // 小写字母 a..z
            if (upper) {
                result.add(b - 32u8)
            } else {
                result.add(b)
            }
        }
    }

    let arr = Array<UInt8>(result.size, { i: Int64 => result[i] })
    println(String.fromUtf8(arr))
}
```
