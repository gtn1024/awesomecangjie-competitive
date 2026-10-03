---
oj: dmy
pid: '216'
title: '[R36A]出题组1'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, m \le 10^6$。

## 思路

每个完整出题组消耗 $1$ 名出题人和 $2$ 名验题人，因此答案受限于两种资源：

- 出题人最多能支撑 $n$ 组；
- 验题人最多能支撑 $\lfloor m / 2 \rfloor$ 组。

取两者的较小值即为最多可组建的组数：$\min(n, \lfloor m / 2 \rfloor)$。

## 复杂度

时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.console.*
import std.convert.*

main() {
    let reader = Console.stdIn
    let v = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = v[0]
    let m = v[1]
    let ans = if (n < m / 2) { n } else { m / 2 }
    println(ans)
}
```

</details>

要点：

- 一行读入两个整数，`m / 2` 为整数除法，自然得到 $\lfloor m / 2 \rfloor$。
- 仓颉无 `min64`/`max64`，用 `if-else` 表达式取较小值。
