---
oj: dmy
pid: '325'
title: '[R52D] RECA'
difficulty: 入门
tags:
  - 滑动窗口
  - 字符串
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n,k \le 2 \times 10^5$。

## 思路

把相邻且相同的两个字符之间称为一个坏边。一个子串成为非摩卡串，当且仅当它内部没有坏边。

翻转一个区间时，区间内部的相邻字符会同时翻转，所以它们是否相同不会改变。只有翻转区间左右端点外侧的两条边可能改变。因此，一次操作最多能消除候选子串内部的两个坏边。

若候选子串中有 $x$ 个坏边，那么至少需要 $\lceil x/2 \rceil$ 次操作。这个下界也一定能达到：将坏边按位置排序，每次选取相邻的两个坏边作为区间的左右边界进行翻转，就能同时消除它们；若最后剩下一条坏边，则让翻转区间的另一个边界落在候选子串之外即可。

所以，一个子串可以在至多 $k$ 次操作后变成交替串，当且仅当

$$
x \le 2k.
$$

问题转化为：寻找内部坏边数量不超过 $2k$ 的最长子串。使用双指针维护窗口。右端点每次右移时，加入新产生的相邻边；若坏边数量超过 $2k$，就不断右移左端点并删除离开窗口的边。窗口重新合法后更新答案。

复杂度：时间复杂度为 $O(n)$，空间复杂度为 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.console.*
import std.convert.*

main() {
    let reader = Console.stdIn
    let input = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = input[0]
    let k = input[1]
    let s = reader.readln().getOrThrow().toRuneArray()

    var left: Int64 = 0
    var equalPairs: Int64 = 0
    var answer: Int64 = 1
    for (right in 1..n) {
        if (s[right] == s[right - 1]) {
            equalPairs++
        }
        while (equalPairs > 2 * k) {
            if (s[left] == s[left + 1]) {
                equalPairs--
            }
            left++
        }
        answer = max(answer, right - left + 1)
    }

    println(answer)
}
```

</details>
