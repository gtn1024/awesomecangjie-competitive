---
oj: dmy
pid: '263'
title: '[R43A]猜数'
difficulty: 入门
tags:
  - 枚举
  - 数论
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^3$，$0 \le b_i < a_i \le 10^4$。

## 思路

答案 $x$ 的非负范围很小：题目保证只要 $x$ 不超过 $10^4$ 就可行，因此直接从小到大枚举 $x = 0, 1, \dots, 10^4$，逐个检查是否满足所有条件 $x \bmod a_i = b_i$，第一个全部满足的 $x$ 就是最小答案。

如果枚举完整个范围都没有找到满足条件的 $x$，说明最小可行值超过 $10^4$（或条件本身矛盾），输出 $-1$ 即可。

## 复杂度

枚举 $10^4 + 1$ 个候选值，每个候选检查 $n$ 个条件，时间复杂度 $O(10^4 \cdot n) \le 10^7$，空间复杂度 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let nn = n
    var a = Array<Int64>(nn, { _ => 0 })
    var b = Array<Int64>(nn, { _ => 0 })
    for (i in 0..nn) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        a[i] = line[0]
        b[i] = line[1]
    }
    var ans: Int64 = -1
    var x: Int64 = 0
    while (x <= 10000) {
        var ok = true
        for (i in 0..nn) {
            if (x % a[i] != b[i]) {
                ok = false
                break
            }
        }
        if (ok) {
            ans = x
            break
        }
        x += 1
    }
    println(ans)
}
```

</details>
