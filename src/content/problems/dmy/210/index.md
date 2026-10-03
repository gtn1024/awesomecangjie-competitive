---
oj: dmy
pid: '210'
title: "[R35A]','变'.'"
difficulty: 入门
tags:
  - 字符串
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 100$，字符串仅含大小写字母、数字、`,` 和 `.`。

## 思路

逐字符扫描字符串，遇到 `,`（ASCII 44）就替换成 `.`（ASCII 46），其余字符保持不变，最后输出替换后的结果。

仓颉中 `for (ch in s)` 遍历得到的是 UTF-8 字节（`UInt8`），而 `StringBuilder.append(UInt8)` 会把字节值按数字渲染（如 `72u8` 得到 `"72"` 而非 `"H"`），不适合逐字节拼接。因此这里用 `s.toArray()` 取出底层字节 `Array<Byte>`，原地修改后再用 `String.fromUtf8` 还原为字符串。

## 复杂度

时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.console.*
import std.convert.*

main() {
    let reader = Console.stdIn
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()
    let bytes = s.toArray()
    for (i in 0..bytes.size) {
        if (bytes[i] == 44u8) { // ','
            bytes[i] = 46u8     // '.'
        }
    }
    println(String.fromUtf8(bytes))
}
```

</details>
