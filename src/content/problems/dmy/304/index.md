---
oj: dmy
pid: '304'
title: '[R49B]减法'
difficulty: 普及
tags:
  - 大整数
  - 字符串
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le k \le 100$，$1 \le x \le 10^k - 1$。

## 思路

$10^k - 1$ 是 $k$ 个 9 组成的数，例如 $k = 3$ 时为 $999$。用 $999\cdots9$ 减去 $x$，等价于求 $x$ 的 **9 的补数**：把 $x$ 左侧补前导零到 $k$ 位，再让每一位 $d$ 变成 $9 - d$。例如 $999 - 123 = 876$，每位正是 $9-1=8$、$9-2=7$、$9-3=6$。

注意当 $x = 10^k - 1$（即 $k$ 个 9）时，每一位补数都是 $0$，结果为 $0$；最高位也可能产生前导零，因此最后需要去掉前导零、至少保留一个数字。

由于 $k$ 最大为 $100$，结果可达 $10^{100}$ 量级，超出整数范围，全程用字符串 / 字节数组处理即可。

## 复杂度

时间 $O(k)$，空间 $O(k)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let k = Int64.parse(parts[0])
    let xStr = parts[1]
    let xLen = Int64(xStr.size)
    // 把 x 左补前导 '0' 到 k 位
    let builder = StringBuilder()
    var i = 0
    while (i < k - xLen) {
        builder.append(r'0')
        i++
    }
    builder.append(xStr)
    let padded = builder.toString()
    // 每位做 9 的补数：结果位 = '9' - (c - '0')
    let out = Array<UInt8>(k, { idx: Int64 =>
        let c = padded[idx]
        57u8 - (c - 48u8)
    })
    // 去掉前导零，保留至少一个数字
    var start = 0
    while (start < k - 1 && out[start] == 48u8) {
        start++
    }
    let s = start
    let trimmed = Array<UInt8>(k - s, { idx: Int64 => out[s + idx] })
    println(String.fromUtf8(trimmed))
    return 0
}
```
