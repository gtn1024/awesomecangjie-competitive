---
oj: dmy
pid: '428'
title: '[R69B] osu!'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，字符串仅由 `P`、`G`、`M` 构成。

## 思路

按顺序模拟每个判定：`P` 得 $300 + combo$ 分、`G` 得 $100 + combo$ 分，二者都使连击数加 1；`M` 不得分且连击数归零。边处理边更新最大连击数。

复杂度：时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()
    var score: Int64 = 0
    var combo: Int64 = 0
    var mx: Int64 = 0
    for (i in 0..n) {
        let c = s[i]
        if (c == UInt8(0x50)) {
            score = score + 300 + combo
            combo = combo + 1
        } else if (c == UInt8(0x47)) {
            score = score + 100 + combo
            combo = combo + 1
        } else {
            combo = 0
        }
        if (combo > mx) {
            mx = combo
        }
    }
    println("${score} ${mx}")
}
```

</details>

要点：

- `P`（`0x50`）和 `G`（`0x47`）走加分分支并累加连击，其余（`M`）直接归零连击。
- 总分约 $n \times (300 + n) \approx 4 \times 10^{10}$，用 `Int64` 累加。
