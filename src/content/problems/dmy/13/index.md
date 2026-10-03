---
oj: dmy
pid: '13'
title: '[R3A] 出现次数统计'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$，$1 \le x,A_i \le 10^{18}$。

## 思路

逐个读入 $A_i$，与 $x$ 比较相等则答案加一。

复杂度：时间 $O(n)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let nx = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = nx[0]
    let x = nx[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    var ans: Int64 = 0
    for (i in 0..n) {
        if (a[i] == x) {
            ans += 1
        }
    }
    println(ans)
}
```

</details>

要点：

- $x$ 和 $A_i$ 可达 $10^{18}$，必须用 `Int64` 读入。
- 数组按题面在第二行一次性读入，行尾多余空格由 `split(" ", removeEmpty: true)` 过滤。
