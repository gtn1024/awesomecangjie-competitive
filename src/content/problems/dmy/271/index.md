---
oj: dmy
pid: '271'
title: '[R44C]贺卡'
difficulty: 提高
tags:
  - 前缀和
timeLimit: 1s
memoryLimit: 256m
---

> 对于 $100\%$ 的数据，$1 \le n, q \le 2 \times 10^5$，$1 \le l \le r \le n$，$1 \le a_i \le 10^9$。

## 思路

剪下的图形是区间 $[l, r]$ 内 $r-l+1$ 个宽为 $1$、底边共线的矩形条组成的整体。它的周长可以按 **水平边 + 竖直边** 两部分拆开计算。

**水平边**：底部是一条连续的水平线，长度为 $r-l+1$；顶部虽然高低起伏，但每个矩形顶部水平段长度恰为 $1$，整体投影覆盖 $[l, r]$，所以顶部水平总长恒为 $r-l+1$，与高度无关。水平边合计 $2(r-l+1)$。

**竖直边**：左边界从地面升起 $a_l$、右边界降到地面 $a_r$，各贡献一条长为 $a_l$、$a_r$ 的竖直边；相邻两个矩形条之间因高度差 $|a_{i+1}-a_i|$ 产生台阶，每级台阶贡献一段长度为 $|a_{i+1}-a_i|$ 的竖直边。竖直边合计 $a_l + a_r + \sum_{i=l}^{r-1} |a_{i+1}-a_i|$。

因此单次询问的答案为：

$$
\text{ans} = 2(r-l+1) + a_l + a_r + \sum_{i=l}^{r-1} |a_{i+1}-a_i|.
$$

其中差和部分是相邻高度差绝对值的一段区间和，令 $d_i = |a_{i+1}-a_i|$，预处理前缀和 $S_i = \sum_{j=1}^{i} d_j$，则 $\sum_{i=l}^{r-1} d_i = S_{r-1} - S_{l-1}$，每次询问 $O(1)$ 回答。

以样例 $l=2, r=4$，$a=[3,2,4,1,5]$ 为例：水平 $2 \times 3 = 6$，竖直 $a_2 + a_4 + |4-2| + |1-4| = 2 + 1 + 2 + 3 = 8$，合计 $6 + 8 = 14$，与样例一致。

## 复杂度

- 预处理差分前缀和：$O(n)$。
- $q$ 次询问，每次 $O(1)$，合计 $O(q)$。
- 总时间复杂度 $O(n+q)$，空间复杂度 $O(n)$，可在 1s/256MB 限制内通过。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let q = first[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    // a 是 0-indexed；为了公式方便用 0-indexed 推导
    // prefixD[i] = sum_{j=0}^{i-1} |a[j+1]-a[j]|，即 prefixD[0]=0
    // 区间 [l,r]（1-indexed，闭）的差和 = sum_{i=l}^{r-1} |a[i+1]-a[i]| = prefixD[r-1] - prefixD[l-1]
    let nn = n
    let prefixD = Array<Int64>(nn + 1, { _ => 0 })
    var acc = Int64(0)
    for (i in 1..nn) {
        var d = a[i] - a[i - 1]
        if (d < 0) { d = -d }
        acc += d
        prefixD[i] = acc
    }
    let writer = getStdOut()
    var k = Int64(0)
    while (k < q) {
        k += 1
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let l = line[0]
        let r = line[1]
        // 周长 = 2*(r-l+1) + a[l] + a[r] + (prefixD[r-1] - prefixD[l-1])
        // a 是 0-indexed，所以 a[l-1], a[r-1]
        var ans = Int64(2) * (r - l + 1)
        ans += a[l - 1]
        ans += a[r - 1]
        ans += prefixD[r - 1] - prefixD[l - 1]
        writer.writeln(ans.toString())
    }
}
```
