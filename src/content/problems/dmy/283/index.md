---
oj: dmy
pid: '283'
title: '[R46C]文字编辑器'
difficulty: 提高
tags:
  - 贪心
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \le n \le 10^5$，$1 \le m \le 10^6$，$1 \le a_i \le m$。

## 思路

题目要求按输入顺序贪心排版：能放当前行就放，放不下就另起一行。注意题面第 4 条规则已经规定了「能放则放」，因此 **不需要做任何回溯或全局优化**，只需一遍顺序模拟即可得到最少行数。

维护两个变量：

- `cur`：当前行已占用的宽度（含单词之间的空格）；
- `lines`：当前已使用的行数，初始为 1。

对每个长度为 `len` 的单词：

1. 若 `cur == 0`（处于一个刚换好的新行），直接放入：`cur = len`；
2. 否则若 `cur + 1 + len <= m`，能与当前行已有的内容用 1 个空格隔开放下：`cur += 1 + len`；
3. 否则放不下，**另起一行**：`lines += 1`，`cur = len`。

由于题目保证 $a_i \le m$，单个单词总能放进一个新行，不会出现无解情况。

以样例 $n=5, m=10, a=[3,4,2,5,2]$ 为例：

- 单词 1：新行，`cur=3`；
- 单词 2：$3+1+4=8 \le 10$，`cur=8`；
- 单词 3：$8+1+2=11>10$，换行，`cur=2`，`lines=2`；
- 单词 4：$2+1+5=8 \le 10$，`cur=8`；
- 单词 5：$8+1+2=11>10$，换行，`cur=2`，`lines=3`。

最终答案为 3。

## 复杂度

- 时间复杂度：$O(n)$，每个单词处理一次。
- 空间复杂度：$O(n)$，用于存储单词长度数组。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let m = Int64.parse(first[1])
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    var lines = Int64(1)
    var cur = Int64(0)
    for (i in 0..Int64(a.size)) {
        let len = a[i]
        if (cur == 0) {
            cur = len
        } else if (cur + 1 + len <= m) {
            cur += 1 + len
        } else {
            lines += 1
            cur = len
        }
    }
    println(lines)
}
```

</details>
