---
oj: dmy
pid: '31'
title: '[R6A] wow'
difficulty: 入门
tags:
  - 字符串
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^6$。

## 思路

枚举起点 $i$（$0 \le i \le n - 3$），判断 $S[i..i+2]$ 是否为 `wow`，是则答案加一。注意 `wowow` 中两个 `wow` 重叠，需要按起点逐个枚举，不能用不重叠匹配。

复杂度：时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()
    let r = s.toRuneArray()
    var ans: Int64 = 0
    for (i in 0..(n - 2)) {
        if (r[i] == r'w' && r[i + 1] == r'o' && r[i + 2] == r'w') {
            ans = ans + 1
        }
    }
    println(ans)
}
```

</details>
