---
oj: dmy
pid: '410'
title: '[R66B] 游戏装备'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$，$0 \le x < 998244353$。

## 思路

用变量维护当前战斗力（始终保持在模 $998244353$ 意义下）：A 类型装备做加法后取模，B 类型装备做乘法后取模。每件装备处理完输出一次。

复杂度：时间 $O(n)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    var cur: Int64 = 0
    for (i in 0..n) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        let x = Int64.parse(line[1])
        if (line[0] == "A") {
            cur = (cur + x) % 998244353
        } else {
            cur = (cur * x) % 998244353
        }
        println(cur)
    }
}
```

</details>

要点：

- 每步都取模，中间值始终小于模数，`Int64` 乘法不会溢出（$(10^9)^2 \approx 10^{18}$ 在 `Int64` 范围内）。
- 类型字符按整行 `split` 后取第一个元素与 `"A"` 比较，`B` 类型走 else 分支。
