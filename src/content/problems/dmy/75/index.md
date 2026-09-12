---
oj: dmy
pid: '75'
title: '[R13C] 消除游戏'
difficulty: 普及
tags:
  - 栈
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^6$，$s$ 仅由小写字母组成。

## 思路

用一个栈（数组）从左到右模拟添加方块的过程。关键观察：每个字母只可能在栈中至多出现一次——因为一旦栈中出现两个相同字母，它们连同中间部分就会被立刻消除。所以可以用一个大小为 26 的布尔数组 `inStack` 记录每个字母当前是否在栈中，从而 $O(1)$ 判断是否触发消除。

依次处理每个字符 $ch$：

- 若 `inStack[ch]` 为 `false`，说明栈中没有 $ch$，直接入栈，并标记为 `true`；
- 若 `inStack[ch]` 为 `true`，说明栈中已有 $ch$，需要消除从栈顶到那个 $ch$ 之间的所有元素：不断弹栈，并把弹出元素对应的 `inStack` 复位为 `false`，直到弹出的元素恰好是 $ch$ 为止。

每个字母至多入栈一次、出栈一次，总操作数为 $O(n)$，时间复杂度 $O(n)$，空间复杂度 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.collection.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()
    let arr = s.toRuneArray()
    let stack = ArrayList<Rune>()
    var inStack = Array<Bool>(26, { _ => false })
    for (i in 0..n) {
        let ch = arr[i]
        let idx = Int64(UInt32(ch) - UInt32(r'a'))
        if (inStack[idx]) {
            while (true) {
                let top = stack.remove(at: stack.size - 1)
                let tidx = Int64(UInt32(top) - UInt32(r'a'))
                inStack[tidx] = false
                if (tidx == idx) {
                    break
                }
            }
        } else {
            stack.add(ch)
            inStack[idx] = true
        }
    }
    for (ch in stack) {
        print(ch)
    }
    println()
}
```

要点：

- 用 `inStack` 布尔数组把「栈中是否已有该字母」的判断从 $O(n)$ 降到 $O(1)$，这是保证总复杂度为 $O(n)$ 的关键；若每次都线性扫描整个栈判断，最坏会退化到 $O(n^2)$。
- 字符串遍历用 `toRuneArray()` 转为 `Rune` 数组，避免按字节（`UInt8`）处理；`Rune` 与整数互算通过 `UInt32(...)` 构造式转换。
- 消除时从栈顶弹到目标字母为止，弹出元素对应的 `inStack` 要及时复位，保证后续判断正确。
