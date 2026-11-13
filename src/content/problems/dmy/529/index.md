---
oj: dmy
pid: '529'
title: '[R83A] 串'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 1000$，$S$ 只含小写英文字母。

## 思路

**只需要最后的位置。** 对每个字母，答案只取决于它最后出现的那一次，之前出现多少次都不影响结果。因此顺序扫描整个字符串，遇到一个字母就把它的答案改写为当前位置即可；扫描结束后，没被改写过的字母答案仍是初值。

**下标约定。** 开一个长度为 $26$ 的数组，用 `s[i] - 'a'` 把字母映射到 $0 \sim 25$，初值全部设为 $-1$。字符串下标从 $0$ 开始，而题目要求的位置从 $1$ 开始，所以写入的是 $i + 1$。

**输出。** 按 `a` 到 `z` 的顺序把 $26$ 个答案用空格连接成一行，末尾不留多余空格。

## 复杂度

扫描字符串一次，时间 $O(n)$；数组只占 $26$ 个位置，空间 $O(1)$（不计输入本身）。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let n = Int64.parse(getStdIn().readln().getOrThrow())
    let s = getStdIn().readln().getOrThrow().toRuneArray()
    let last = Array<Int64>(26, { _ => -1 })
    for (i in 0..n) {
        let k = Int64(UInt32(s[i])) - Int64(UInt32(r'a'))
        last[k] = i + 1
    }
    let sb = StringBuilder()
    for (j in 0..26) {
        if (j > 0) {
            sb.append(" ")
        }
        sb.append(last[j])
    }
    println(sb.toString())
}
```

</details>
