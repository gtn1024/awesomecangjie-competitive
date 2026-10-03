---
oj: dmy
pid: '483'
title: '[R78C] 删除字符2'
difficulty: 普及-
tags:
  - 枚举
  - 字符串
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$s$ 仅由大写英文字母组成。

## 思路

注意到删除字母 $c$ 后，剩下的字符串就是 $s$ 中所有不等于 $c$ 的字符按原相对顺序拼接而成。因此删除 $c$ 后的连击数，等于「幸存字符序列中相邻且相同的对数」，也就是：扫一遍 $s$，跳过所有等于 $c$ 的字符，维护上一个幸存字符 $prev$，每当当前幸存字符与 $prev$ 相同就贡献一对连击。

字母表只有 $26$ 个字母，直接枚举删除哪一种字母 $c$，对每种 $c$ 按上面的方式扫一遍字符串统计连击数，取最大值即可。注意只能删除在 $s$ 中至少出现一次的字母，但这对求最大值没有影响（最优解对应的字母一定出现过），实现时跳过未出现的字母即可。

## 复杂度

枚举 $26$ 个字母，每个字母扫一遍字符串，时间复杂度 $O(26n)$；除输入字符串外只用常数个变量，空间复杂度 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*

main() {
    let reader = getStdIn()
    reader.readln()
    let s = reader.readln().getOrThrow()
    var appear = Array<Bool>(26, { _ => false })
    for (ch in s) {
        appear[Int64(ch) - 65] = true
    }
    var ans: Int64 = 0
    var c: Int64 = 0
    while (c < 26) {
        if (appear[c]) {
            let del = UInt8(65 + c)
            var prev: Int64 = -1
            var cur: Int64 = 0
            for (ch in s) {
                if (ch != del) {
                    let v = Int64(ch)
                    if (v == prev) {
                        cur += 1
                    }
                    prev = v
                }
            }
            if (cur > ans) {
                ans = cur
            }
        }
        c += 1
    }
    println(ans)
}
```

</details>
