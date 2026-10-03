---
oj: dmy
pid: '61'
title: '[R11A] 出现奇数次的偶数'
difficulty: 入门
tags:
  - 计数
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 1000$，$1 \le A_i \le 1000$。

## 思路

用计数数组统计每个数出现的次数，然后找出出现次数为奇数的偶数中的最大值。

具体地，开一个下标范围 $1 \sim 1000$ 的计数数组 $cnt$，第一遍扫描 $A$ 完成统计；第二遍正序枚举 $1 \sim 1000$ 中的偶数 $x$，若 $cnt[x]$ 为奇数则更新答案，循环结束后答案即为最大的满足条件的偶数。若始终没有更新，答案保持初值 $-1$。

复杂度：时间 $O(n + V)$，空间 $O(V)$，其中 $V = 1000$ 为值域大小。

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
    var cnt = Array<Int64>(1001, { _ => 0 })
    for (x in a) {
        cnt[x] = cnt[x] + 1
    }
    var ans: Int64 = -1
    for (x in 1..1001) {
        if (x % 2 == 0 && cnt[x] % 2 == 1) {
            ans = x
        }
    }
    println(ans)
}
```

</details>

要点：

- 数组下标范围 $1 \sim 1000$，计数数组开 1001 个元素即可，$A_i$ 直接作为下标。
- 答案要取「最大」的奇数频次偶数，正序枚举时后遇到符合条件的 $x$ 会覆盖掉先前值，循环结束后自然留下最大值。
