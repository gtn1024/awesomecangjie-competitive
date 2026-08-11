---
oj: dmy
pid: '9'
title: '[R2C] 三元组'
difficulty: 普及/提高-
tags:
  - 组合数学
  - 排序
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$3 \le n \le 10^6$，$-10^9 \le A_i \le 10^9$。

## 思路

满足 $A_i=A_j=A_k$ 的三元组 $(i,j,k)$ 与数值无关，只与每种数值的出现次数有关：若数值 $x$ 出现 $c$ 次，则贡献 $\binom{c}{3} = c(c-1)(c-2)/6$。

把所有数排序后，相同的值连成一段，扫描每段长度即可统计。$A_i$ 范围大不能直接开计数数组，排序是 $O(n \log n)$。

复杂度：时间 $O(n \log n)$（排序），空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    sort(a)
    var ans: Int64 = 0
    var i: Int64 = 0
    while (i < n) {
        var j = i
        while (j < n && a[j] == a[i]) {
            j += 1
        }
        let c = j - i
        if (c >= 3) {
            ans += c * (c - 1) * (c - 2) / 6
        }
        i = j
    }
    println(ans)
    return 0
}
```

要点：

- 答案最大为 $\binom{n}{3} \approx 1.7 \times 10^{17}$，用 `Int64` 保存，乘法过程中不会溢出。
