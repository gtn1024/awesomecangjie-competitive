---
oj: dmy
pid: '129'
title: '[R22A]谁获胜了'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le T \le 100$，$2 \le |s| \le 100$，且 $s_i \in \{\text{A}, \text{B}\}$。

## 思路

规则是一方领先另一方 $2$ 场则立即结束。题目保证「比赛最后才能决定出胜负」，说明最后一局恰好让一方的累计胜场数超过另一方 $2$。因此胜方的胜场总数一定比败方多 $2$，只需统计字符串中 `A` 和 `B` 出现的次数，谁多谁就是获胜者。

## 复杂度

时间 $O(|s|)$，空间 $O(1)$。

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
        let s = reader.readln().getOrThrow()
        var ca: Int64 = 0
        var cb: Int64 = 0
        for (ch in s.toRuneArray()) {
            if (ch == r'A') {
                ca += 1
            } else {
                cb += 1
            }
        }
        if (ca > cb) {
            println("A")
        } else {
            println("B")
        }
    }
}
```

</details>
