---
oj: dmy
pid: '155'
title: '[R26B]n+m'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le T \le 10$，$1 \le n, m \le 10$，$1 \le |s| \le 30$，$s$ 仅由数字和 `+` 构成。

## 思路

字符串 $s$ 必须严格是「$n$ 位数字 + 一个 `+` + $m$ 位数字」的拼接，因此只需同时满足两个条件：

1. $s$ 的第 $n$ 个位置（从 $0$ 开始计数）必须是 `+`，其余位置必须全是数字。由于允许前导 $0$，其余位置只要是 `0`～`9` 即可，无需额外限制。
2. $s$ 的总长度恰好为 $n + m + 1$（前 $n$ 位 + 一个 `+` + 后 $m$ 位），保证 `+` 后面正好有 $m$ 位数字。

第一个条件保证了 `+` 出现的位置唯一且正确，第二个条件则排除「多出数字」或「数字不足」的情况。两者合起来即对应题目所要求的唯一分割方式。

题目保证 $s$ 仅由数字和 `+` 构成，这些都是 ASCII 字符（单字节），所以在仓颉里直接按字节（`UInt8`）遍历即可，无需区分字节与字符。

## 复杂度

每组数据时间 $O(|s|)$，总计 $O(T \cdot |s|)$；空间 $O(|s|)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..t) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let n = Int64.parse(line[0])
        let m = Int64.parse(line[1])
        let s = reader.readln().getOrThrow()
        // s 仅含数字与 '+'，均为 ASCII，故按字节遍历即可；字符数 == 字节数
        var idx: Int64 = 0
        var ok = true
        for (c in s) {
            let cb = Int64(c)
            if (idx == n) {
                if (cb != 43) {  // '+'
                    ok = false
                }
            } else {
                if (cb < 48 || cb > 57) {  // '0'..'9'
                    ok = false
                }
            }
            idx += 1
        }
        if (idx != n + m + 1) {
            ok = false
        }
        if (ok) {
            println("Yes")
        } else {
            println("No")
        }
    }
}
```

</details>
