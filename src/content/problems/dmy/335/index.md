---
oj: dmy
pid: '335'
title: '[R54B]身份证号'
difficulty: 入门
tags:
  - 字符串
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \le |s| \le 100$，且 $s$ 中只包含大写字母、小写字母和数字。

## 思路

题目要求按身份证号规则逐项校验字符串 $s$：长度恰好为 $8$；前两个字符是 `A` 到 `G` 之间的大写字母；第 $3$ 到第 $7$ 个字符是数字 $0 \sim 9$；最后一个字符是数字或大写字母 `X`。

由于 $s$ 中只含 ASCII 字符（字母与数字），可以按字节逐位判断。按规则顺序设置四道关卡，任意一道不满足即输出 `No` 并提前结束，全部通过才输出 `Yes`：

1. 长度校验：若 $|s| \ne 8$，直接 `No`。
2. 前缀校验：$s[0]$ 和 $s[1]$ 的字节值应落在 `A` 到 `G` 的范围（$65 \sim 71$）。
3. 数字段校验：$s[2] \sim s[6]$ 五个字节应落在 `0` 到 `9` 的范围（$48 \sim 57$）。
4. 末位校验：$s[7]$ 应是数字，或等于大写字母 `X`（$88$）。

## 复杂度

- 时间复杂度：$O(|s|)$，至多扫描 $8$ 个字节。
- 空间复杂度：$O(|s|)$，存储输入字符串。

## 仓颉实现

```cangjie
import std.env.*

main(): Int64 {
    let reader = getStdIn()
    let s = reader.readln().getOrThrow()
    if (s.size != 8) {
        println("No")
        return 0
    }
    // s[0], s[1] in 'A'..'G' (65..71)
    if (s[0] < UInt8(65) || s[0] > UInt8(71) || s[1] < UInt8(65) || s[1] > UInt8(71)) {
        println("No")
        return 0
    }
    // s[2..6] digits '0'..'9' (48..57)
    var i = 2
    while (i <= 6) {
        if (s[i] < UInt8(48) || s[i] > UInt8(57)) {
            println("No")
            return 0
        }
        i += 1
    }
    // s[7] digit or 'X' (88)
    let last = s[7]
    if ((last >= UInt8(48) && last <= UInt8(57)) || last == UInt8(88)) {
        println("Yes")
    } else {
        println("No")
    }
    return 0
}
```
