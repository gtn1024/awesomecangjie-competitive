---
oj: dmy
pid: '8'
title: '[R2B] 向前看'
difficulty: 入门
tags:
  - 贪心
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$1 \le h_i \le 10^9$。

## 思路

第 $i$ 个人满足条件当且仅当 $h_i$ 严格大于前 $i-1$ 个人的最大值。维护前缀最大值 $mx$，扫描时若 $h_i > mx$ 则答案加一并更新 $mx$。

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
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    var ans: Int64 = 0
    var mx: Int64 = 0
    for (i in 0..n) {
        if (a[i] > mx) {
            ans += 1
            mx = a[i]
        }
    }
    println(ans)
}
```

</details>

要点：

- 条件是「严格高于」前面所有人，相等的身高不算；$h_i \ge 1$，前缀最大值初值为 $0$ 时第一个人必然计入答案。
- 输入行尾可能有多余空格，用 `split(" ", removeEmpty: true)` 过滤空串。
