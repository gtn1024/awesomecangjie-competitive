---
oj: dmy
pid: '458'
title: '[R74B] 字符队列整理'
difficulty: 入门
tags:
  - 枚举
  - 模拟
  - 字符串
timeLimit: 2s
memoryLimit: 256m
---

> 数据规模：$1 \le n \le 100$，$s$ 只包含小写英文字母。

## 思路

操作的选择只有 $n$ 种：把字符串的第 $i$ 个字符取出放到末尾。由于 $n \le 100$，直接枚举每一种选择并模拟出结果串，逐个统计得分即可。

具体地，取出位置 $i$ 上的字符后，新串的顺序是

$$
s_0 s_1 \cdots s_{i-1} s_{i+1} \cdots s_{n-1} s_i
$$

统计它的得分，只需按这个顺序依次走一遍：维护上一个字符，若当前字符与上一个相同则得分加一。实现时先扫过除 $i$ 之外的 $n-1$ 个字符，最后把 $s_i$ 放到末尾再比较一次。这里要注意新串的末尾就是 $s_i$，它的后面不再有字符，因此统计完这一次比较就结束。

选择最后一个位置（$i = n-1$）时新串与原串完全相同，这种情况同样被枚举覆盖，不需要单独处理。所有 $n$ 种结果取最大值即为答案。

## 复杂度

时间 $O(n^2)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()
    let ch = s.toRuneArray()

    var ans: Int64 = 0
    // 枚举被取出并移到末尾的位置 i
    for (i in 0..n) {
        var prev: Int64 = -1
        var cur: Int64 = 0
        for (j in 0..n) {
            if (j == i) {
                continue
            }
            let c = Int64(UInt32(ch[j]))
            if (c == prev) {
                cur += 1
            }
            prev = c
        }
        let last = Int64(UInt32(ch[i]))
        if (last == prev) {
            cur += 1
        }
        if (cur > ans) {
            ans = cur
        }
    }
    println(ans.toString())
    return 0
}
```
