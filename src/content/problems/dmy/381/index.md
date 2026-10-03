---
oj: dmy
pid: '381'
title: '[R61C] 灯'
difficulty: 普及
tags:
  - 枚举
  - 前缀和
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le m \le n \le 2 \times 10^5$，字符串 $S$ 仅由 `o` 和 `x` 组成。

## 思路

一次操作会把选定区间内的所有灯点亮，**不会使原本亮着的灯熄灭**，所以亮灯数量随操作区间变大只增不减。因此一定存在一个最优方案使用长度恰为 $m$ 的区间（或从位置 $1$ 起的长度 $< m$ 的区间），不必再枚举更短的内部区间。

预处理两个前缀计数（下标从 $0$ 开始）：

- $\mathit{pre}[i]$ 表示前缀 $[0,i)$ 中字符 `o` 的数量；
- $\mathit{suf}[i]$ 表示后缀 $[i,n)$ 中字符 `o` 的数量。

枚举操作区间的右端点 $r$，令 $l=\max(0,\,r-m+1)$，则操作区间 $[l,r]$ 长度为 $r-l+1\le m$。执行操作后：

- 区间 $[l,r]$ 内的 $r-l+1$ 盏灯全部亮起；
- 左侧 $[0,l)$ 原本亮着的有 $\mathit{pre}[l]$ 盏；
- 右侧 $[r+1,n)$ 原本亮着的有 $\mathit{suf}[r+1]$ 盏。

于是亮灯总数为

$$(r-l+1)+\mathit{pre}[l]+\mathit{suf}[r+1].$$

对所有 $0\le r<n$ 取最大值即为答案。注意「不操作」也是合法方案，所以答案至少为初始亮灯数 $\mathit{pre}[n]$（实际上它会被某个长度 $m$ 的区间覆盖，但写上更稳妥）。

时间复杂度 $O(n)$，空间复杂度 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = line[0]
    let m = line[1]
    let s = reader.readln().getOrThrow().toRuneArray()

    // pre[i] = number of 'o' in [0, i)
    let pre = Array<Int64>(n + 1, { _ => 0 })
    var i = 0
    while (i < n) {
        pre[i + 1] = pre[i] + (if (s[i] == r'o') { 1 } else { 0 })
        i += 1
    }
    // suf[i] = number of 'o' in [i, n)
    let suf = Array<Int64>(n + 1, { _ => 0 })
    var j = n
    while (j > 0) {
        j -= 1
        suf[j] = suf[j + 1] + (if (s[j] == r'o') { 1 } else { 0 })
    }

    var ans = pre[n] // not operating is also an option
    var r = 0
    while (r < n) {
        let l = if (r - m + 1 >= 0) { r - m + 1 } else { 0 }
        let lit = Int64(r - l + 1)
        let total = lit + pre[l] + suf[r + 1]
        if (total > ans) {
            ans = total
        }
        r += 1
    }
    println(ans)
}
```

</details>

## 要点

- **单调性**：点亮不会使灯熄灭，扩大区间只会增加亮灯数，因此最优区间必可取到长度 $m$（或 $1$ 起的最长前缀），只需对每个右端点 $r$ 计算一个区间即可，无需双循环枚举。
- **预处理**：前缀 `o` 数 $\mathit{pre}$ 与后缀 `o` 数 $\mathit{suf}$ 让任意 $[l,r]$ 的贡献变成 $O(1)$，整体降到 $O(n)$。
- **字符处理**：仓颉中遍历 `String` 得到 `UInt8` 字节，与 Rune 比较需先 `toRuneArray()`，比较字面量写成 `r'o'`。
- 别漏「不操作」的下界 $\mathit{pre}[n]$，逻辑上更稳妥。
