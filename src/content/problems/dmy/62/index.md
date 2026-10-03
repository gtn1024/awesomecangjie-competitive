---
oj: dmy
pid: '62'
title: '[R11B] 前三小'
difficulty: 入门
tags:
  - 排序
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$3 \le n \le 10^5$，$1 \le A_i \le 10^9$，$A$ 中数字互不相同。

## 思路

「前三小」就是排序后第 3 小的那个数，记为 $m_3$；由于数字互不相同，数组中恰好有 3 个数不超过 $m_3$。答案要求按原数组中的出现顺序输出这 3 个数，因此先把数组复制一份排序取到 $m_3$，再扫一遍原数组，把不超过 $m_3$ 的数按顺序输出即可。

复杂度：时间 $O(n \log n)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let b = Array<Int64>(n, { i => a[i] })
    sort(b)
    let m3 = b[2]
    var first = true
    for (x in a) {
        if (x <= m3) {
            if (!first) {
                print(" ")
            }
            print(x)
            first = false
        }
    }
    println()
}
```

</details>

要点：

- 全局函数 `sort` 是原地排序，会破坏原数组的顺序，所以先复制一份再排。
- 输出前三个数时用 `first` 标志控制分隔符，避免行尾多余空格。
