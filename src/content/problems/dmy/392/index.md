---
oj: dmy
pid: '392'
title: '[R63B] 升级包'
difficulty: 入门
tags:
  - 贪心
  - 排序
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 1000$，$1 \le s_i \le 10^9$。

## 思路

购买 $k$ 个升级包要额外丢弃 $2k$ 个未购买的包，共消耗 $3k$ 个，所以 $k \le \lfloor n/3 \rfloor$。力量值全为正数，购买越多越好，于是 $k$ 取最大值 $\lfloor n/3 \rfloor$；要总和最大，选力量值最大的 $k$ 个包即可。

把所有力量值降序排序，对前 $\lfloor n/3 \rfloor$ 个求和。

复杂度：时间 $O(n \log n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    sort(s, descending: true)
    var ans: Int64 = 0
    for (i in 0..(n / 3)) {
        ans = ans + s[i]
    }
    println(ans)
    return 0
}
```

要点：

- 全局函数 `sort(a, descending: true)` 直接降序排序原数组，取前 $\lfloor n/3 \rfloor$ 个求和即可。
- 力量值可达 $10^9$，$k$ 个求和约 $3.3 \times 10^{11}$，需要用 `Int64`。
