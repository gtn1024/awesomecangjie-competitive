---
oj: dmy
pid: '310'
title: '[R50B]字符串拼接'
difficulty: 普及
tags:
  - 字符串
  - 哈希
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \leq n \leq 26$，每个字符串 $c_i$ 的长度 $1 \leq |c_i| \leq 1000$，保证 $n$ 个字符串的第一个字符互不相同。

## 思路

题目的关键约束是 **$n$ 个字符串的第一个字符互不相同**。这意味着只要知道某一段的开头字符，就能唯一确定这一段是哪个 $c_i$。

由于 $S$ 是由 $c_1, c_2, \dots, c_n$ 按某种顺序首尾相接拼成的，那么从 $S$ 的起点开始，每一段的起始位置就恰好是某个 $c_i$ 的开头。于是只需用一个指针 $\textit{pos}$ 从 $0$ 开始扫描 $S$：

1. 取 $S[\textit{pos}]$ 作为当前段的首字符；
2. 通过首字符映射到对应的编号 $k$（首字符唯一，映射唯一）；
3. 输出 $k$，并把 $\textit{pos}$ 向后移动 $|c_k|$ 个位置，即跳过整段 $c_k$；
4. 重复直到 $\textit{pos}$ 走到 $S$ 末尾。

用一个哈希表记录「首字符 $\to$ 编号」，再用一个数组记录「编号 $\to$ 字符串长度」即可。整个过程只需对 $S$ 扫描一遍，每个字符只访问一次，无需回溯或匹配。

## 复杂度

时间 $O(|S|)$，等价于 $O\left(\sum |c_i|\right)$；空间 $O(n)$ 用于哈希表与长度数组。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.collection.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())

    // first char (UInt8 byte) -> index (1-based)
    let firstCharToIdx = HashMap<UInt8, Int64>()
    // index (1-based) -> length
    let lenArr = Array<Int64>(Int64(n), { _ => 0 })

    var i: Int64 = 0
    while (i < n) {
        let s = reader.readln().getOrThrow()
        let firstByte = UInt8(s[0])
        firstCharToIdx.add(firstByte, i + 1)
        lenArr[i] = Int64(s.size)
        i++
    }

    let s = reader.readln().getOrThrow()
    let totalLen = Int64(s.size)

    var pos: Int64 = 0
    var first: Bool = true
    while (pos < totalLen) {
        let firstByte = UInt8(s[pos])
        let idx = firstCharToIdx[firstByte]
        if (!first) {
            print(" ")
        }
        print(idx)
        first = false
        pos += lenArr[idx - 1]
    }
    println()
}
```

</details>
