---
oj: dmy
pid: '397'
title: '[R64A] 10'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 100$。

## 思路

$10^n$ 是 1 后面跟 $n$ 个 0，共 $n+1$ 位，超出了 `Int64` 的表示范围，直接用字符串输出。

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
    print("1")
    for (i in 0..n) {
        print("0")
    }
    println()
}
```

</details>

要点：

- 直接用 println 逐个输出 `n + 1` 个字符即可，不需要任何数值运算。
